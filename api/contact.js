/**
 * Fonction serverless Vercel : réception des demandes d'audit du formulaire /contact/.
 *
 * - valide les champs (mêmes règles que le formulaire) ;
 * - ignore les robots (champ piège « site_web ») ;
 * - limite le débit par adresse IP (au mieux : mémoire de l'instance) ;
 * - envoie un e-mail à Vivo Partner et un accusé de réception au prospect via l'API de Brevo
 *   (service français d'e-mails transactionnels, données hébergées en Europe).
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
const hits = new Map();

const clean = (v, max = 2000) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, max);

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function validate(body) {
  const data = {
    nom: clean(body.nom, 120),
    entreprise: clean(body.entreprise, 160),
    secteur: clean(body.secteur, 160),
    tel: clean(body.tel, 40),
    email: clean(body.email, 200),
    message: clean(body.message, 5000),
    consentement: clean(body.consentement, 10),
    site_web: clean(body.site_web, 200),
  };
  const errors = {};
  if (!data.nom) errors.nom = 'Indiquez votre nom.';
  if (data.tel.replace(/[^0-9+]/g, '').length < 9)
    errors.tel = 'Indiquez un numéro de téléphone valide pour être rappelé.';
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email))
    errors.email = 'L’adresse e-mail semble incomplète.';
  if (!data.consentement) errors.consentement = 'Cochez la case pour que votre demande puisse être traitée.';
  return { data, errors };
}

function rateLimited(ip, now = Date.now()) {
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
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
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return Object.fromEntries(new URLSearchParams(req.body));
    }
  }
  return {};
}

// Réponse adaptée : JSON pour le script du site, page HTML simple pour un envoi sans JavaScript.
function reply(req, res, status, json, message) {
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
    if (data.email) {
      const firstName = data.nom.split(/\s+/)[0];
      await sendMail(apiKey, {
        from,
        to: data.email,
        replyTo: to,
        subject: 'Votre demande d’audit gratuit — Vivo Partner',
        text: `Bonjour ${firstName},\n\nMerci pour votre demande d’audit gratuit. Je vous rappelle sous 24h ouvrées pour caler un créneau de 30 minutes en visio.\n\nÀ très vite,\nBenjamin Vivo\nVivo Partner — ${PHONE}`,
      });
    }
  } catch (err) {
    console.error('Formulaire : échec de l’envoi', err);
    return reply(req, res, 502, { ok: false, error: 'Envoi impossible pour le moment.' }, unavailable);
  }

  return reply(req, res, 200, { ok: true }, thanks);
}
