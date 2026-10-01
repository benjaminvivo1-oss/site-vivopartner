/**
 * Fonction serverless Vercel : réception des demandes d'audit du formulaire /contact/.
 *
 * - refuse les envois faits depuis un autre site (en-tête Origin) ;
 * - valide les champs (mêmes règles que le formulaire) ;
 * - ignore les robots (champ piège « site_web ») ;
 * - limite le débit par adresse IP et les accusés de réception par destinataire
 *   (au mieux : mémoire de l'instance) ;
 * - envoie un e-mail à Vivo Partner et un accusé de réception au prospect via l'API de Brevo
 *   (service français d'e-mails transactionnels, données hébergées en Europe).
 *   L'accusé ne reprend que le prénom, filtré : le formulaire ne peut pas servir à faire envoyer
 *   un texte libre (lien, publicité…) à une adresse tierce depuis benjamin@vivopartner.com.
 *
 * Variables d'environnement (Vercel > Settings > Environment Variables) :
 *   BREVO_API_KEY  clé API Brevo (obligatoire)
 *   CONTACT_FROM   expéditeur, adresse d'un domaine authentifié dans Brevo
 *                  (défaut : « Vivo Partner <benjamin@vivopartner.com> »)
 *   CONTACT_TO     destinataire des demandes (défaut : benjamin@vivopartner.com)
 */

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_DEFAULT = 'Vivo Partner <benjamin@vivopartner.com>';
const TO_DEFAULT = 'benjamin@vivopartner.com';
const PHONE = '06 40 20 22 46';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const ACK_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ACK_PER_RECIPIENT = 2;
const MAX_TRACKED = 5000;
const hits = new Map();
const acks = new Map();

// Même règle que src/scripts/contact.ts : une seule « @ », pas d'espace ni de caractère de liste d'adresses.
export const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/;
const LINK_RE = /https?:\/\/|www\.|[<>]/i;

// Texte libre (message) : retours à la ligne conservés, autres caractères de contrôle retirés.
const clean = (v, max = 2000) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
// Champ d'une ligne (nom, téléphone, e-mail…) : tout blanc, retour à la ligne compris, devient une espace.
const line = (v, max) =>
  clean(v, max * 2)
    .replace(/\s+/g, ' ')
    .slice(0, max)
    .trim();

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function validate(body) {
  const data = {
    nom: line(body.nom, 120),
    entreprise: line(body.entreprise, 160),
    secteur: line(body.secteur, 160),
    tel: line(body.tel, 40),
    email: line(body.email, 254),
    message: clean(body.message, 5000),
    consentement: line(body.consentement, 10),
    site_web: line(body.site_web, 200),
  };
  const errors = {};
  if (!data.nom) errors.nom = 'Indiquez votre nom.';
  if (data.tel.replace(/[^0-9+]/g, '').length < 9)
    errors.tel = 'Indiquez un numéro de téléphone valide pour être rappelé.';
  if (data.email && !EMAIL_RE.test(data.email)) errors.email = 'L’adresse e-mail semble incomplète.';
  if (!data.consentement) errors.consentement = 'Cochez la case pour que votre demande puisse être traitée.';
  return { data, errors };
}

// Prénom repris dans l'accusé de réception : lettres, apostrophe et trait d'union uniquement, sinon rien.
export function greetingName(nom) {
  const first = String(nom).split(' ')[0] || '';
  return /^\p{L}[\p{L}'’-]{0,29}$/u.test(first) ? first : '';
}

// Compteurs en mémoire : on oublie d'abord les entrées périmées, puis les plus anciennes,
// pour qu'une instance qui reste active longtemps ne grossisse pas sans fin.
function prune(map, windowMs, now) {
  if (map.size <= MAX_TRACKED) return;
  for (const [key, times] of map) if (!times.some((t) => now - t < windowMs)) map.delete(key);
  for (const key of map.keys()) {
    if (map.size <= MAX_TRACKED) break;
    map.delete(key);
  }
}

function rateLimited(ip, now = Date.now()) {
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  prune(hits, WINDOW_MS, now);
  return recent.length > MAX_PER_WINDOW;
}

// Au plus MAX_ACK_PER_RECIPIENT accusés par adresse et par 24 h : le formulaire ne peut pas
// servir à inonder une boîte mail.
function allowAck(email, now = Date.now()) {
  const key = email.toLowerCase();
  const recent = (acks.get(key) || []).filter((t) => now - t < ACK_WINDOW_MS);
  if (recent.length >= MAX_ACK_PER_RECIPIENT) return false;
  recent.push(now);
  acks.set(key, recent);
  prune(acks, ACK_WINDOW_MS, now);
  return true;
}

// Un navigateur envoie toujours l'en-tête Origin avec un POST : s'il désigne un autre site,
// la demande vient d'un formulaire caché ailleurs et on la refuse. Sans Origin (curl…), on laisse passer.
// Acceptés : le domaine qui reçoit la requête (aperçus Vercel compris) et les domaines du site.
const SITE_HOSTS = ['vivopartner.com', 'www.vivopartner.com'];
function foreignOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  const hosts = [req.headers['x-forwarded-host'], req.headers.host, ...SITE_HOSTS].filter(Boolean);
  try {
    return !hosts.includes(new URL(origin).host);
  } catch {
    return true;
  }
}

// « Nom <adresse> » ou « adresse » -> { name, email } (format attendu par Brevo).
export function parseAddress(value) {
  const m = String(value).match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { ...(m[1] ? { name: m[1] } : {}), email: m[2].trim() } : { email: String(value).trim() };
}

async function sendMail(apiKey, { from, to, replyTo, subject, text, html }) {
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: parseAddress(from),
      to: [parseAddress(to)],
      ...(replyTo ? { replyTo: parseAddress(replyTo) } : {}),
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

function readBody(req) {
  let body;
  try {
    body = req.body; // Vercel lit le corps à la demande et lève une erreur si le JSON est mal formé.
  } catch {
    return {};
  }
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return Object.fromEntries(new URLSearchParams(body));
    }
  }
  return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
}

// Réponse adaptée : JSON pour le script du site, page HTML simple pour un envoi sans JavaScript.
function reply(req, res, status, json, message) {
  res.setHeader('Cache-Control', 'no-store');
  const wantsJson = String(req.headers.accept || '').includes('application/json');
  if (wantsJson) return res.status(status).json(json);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res
    .status(status)
    .send(
      `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Demande d’audit — Vivo Partner</title><body style="margin:0;padding:48px 20px;background:#0B2F6B;color:#F8FAFC;font:16px/1.6 system-ui,sans-serif"><main style="max-width:560px;margin:0 auto"><p>${message}</p><p><a style="color:#F58220" href="/contact/">Retour au site</a></p></main></body></html>`,
    );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(req, res, 405, { ok: false, error: 'Méthode non autorisée.' }, 'Méthode non autorisée.');
  }
  if (foreignOrigin(req))
    return reply(req, res, 403, { ok: false, error: 'Origine non autorisée.' }, 'Utilisez le formulaire du site.');

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'inconnue')
    .split(',')[0]
    .trim();
  if (rateLimited(ip))
    return reply(req, res, 429, { ok: false, error: 'Trop de demandes.' }, 'Trop de demandes, réessayez plus tard.');

  const { data, errors } = validate(readBody(req));
  // Champ piège rempli : réponse positive, rien n'est envoyé.
  const thanks = `Demande reçue, merci. Benjamin vous rappelle sous 24h ouvrées pour caler le créneau de votre audit.`;
  if (data.site_web) return reply(req, res, 200, { ok: true }, thanks);
  if (Object.keys(errors).length)
    return reply(req, res, 400, { ok: false, errors }, Object.values(errors).map(escapeHtml).join('<br>'));

  const unavailable = `L’envoi n’a pas abouti. Appelez le ${PHONE} ou écrivez à ${TO_DEFAULT}.`;
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.CONTACT_FROM || FROM_DEFAULT;
  const to = process.env.CONTACT_TO || TO_DEFAULT;
  if (!apiKey) {
    console.error('Formulaire : BREVO_API_KEY manquante.');
    return reply(req, res, 500, { ok: false, error: 'Envoi indisponible.' }, unavailable);
  }

  const rows = [
    ['Nom', data.nom],
    ['Entreprise', data.entreprise || '—'],
    ['Secteur', data.secteur || '—'],
    ['Téléphone', data.tel],
    ['E-mail', data.email || '—'],
  ];
  const text = `${rows.map(([k, v]) => `${k} : ${v}`).join('\n')}\n\n${data.message || '(pas de message)'}`;
  const html = `<table cellpadding="6">${rows
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join('')}</table><p style="white-space:pre-line">${escapeHtml(data.message || '(pas de message)')}</p>`;
  const subject = `Demande d’audit — ${data.nom}${data.entreprise ? ` (${data.entreprise})` : ''}`;

  try {
    await sendMail(apiKey, { from, to, subject, text, html, ...(data.email ? { replyTo: data.email } : {}) });
  } catch (err) {
    console.error('Formulaire : échec de l’envoi', err);
    return reply(req, res, 502, { ok: false, error: 'Envoi impossible pour le moment.' }, unavailable);
  }

  // Accusé de réception : pas si le nom ou l'entreprise contiennent un lien (demande quand même transmise).
  // Son échec n'annule pas la demande, déjà arrivée chez Vivo Partner.
  if (data.email && !LINK_RE.test(`${data.nom} ${data.entreprise}`) && allowAck(data.email)) {
    const name = greetingName(data.nom);
    try {
      await sendMail(apiKey, {
        from,
        to: data.email,
        replyTo: to,
        subject: 'Votre demande d’audit gratuit — Vivo Partner',
        text: `Bonjour${name ? ` ${name}` : ''},\n\nMerci pour votre demande d’audit gratuit. Je vous rappelle sous 24h ouvrées pour caler un créneau de 30 minutes en visio.\n\nÀ très vite,\nBenjamin Vivo\nVivo Partner — ${PHONE}`,
      });
    } catch (err) {
      console.error('Formulaire : échec de l’accusé de réception', err);
    }
  }

  return reply(req, res, 200, { ok: true }, thanks);
}
