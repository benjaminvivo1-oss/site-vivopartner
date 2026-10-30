/**
 * Formulaires de demande d'audit (accueil et /contact/) : mêmes règles que la maquette v3
 * (nom et téléphone obligatoires), erreur sous le champ concerné (aria-describedby, aria-invalid,
 * focus sur le premier champ en erreur), anti-spam (champ piège + délai entre deux envois),
 * envoi JSON vers PUBLIC_CONTACT_ENDPOINT (par défaut /api/contact), confirmation annoncée.
 * Sans JavaScript, le formulaire est envoyé normalement à /api/contact.
 */
import { track } from './track';
import { bindAll } from './bind';

const COOLDOWN_MS = 30_000;
const STORAGE_KEY = 'vp-audit-sent-at';

document.querySelectorAll<HTMLFormElement>('form[data-contact-form]').forEach(initForm);

function initForm(form: HTMLFormElement) {
  form.noValidate = true; // la validation native reste active sans JavaScript
  const endpoint = form.dataset.endpoint || '';
  const inbox = form.dataset.email || '';
  const phone = form.dataset.phone || '';
  const alertBox = form.querySelector<HTMLElement>('[data-form-error]');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const el = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;

  const rules: { name: string; test: (v: string) => boolean }[] = [
    { name: 'nom', test: (v) => v.length > 0 },
    { name: 'tel', test: (v) => v.replace(/[^0-9+]/g, '').length >= 9 },
  ];

  const errorOf = (input: HTMLInputElement) => document.getElementById(input.getAttribute('aria-describedby') || '');
  const setError = (input: HTMLInputElement, invalid: boolean) => {
    const msg = errorOf(input);
    if (msg) msg.hidden = !invalid;
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  // L'erreur disparaît dès que le champ est corrigé.
  rules.forEach(({ name, test }) => {
    const input = el(name);
    input?.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(input, !test(input.value.trim()));
    });
  });

  // Message d'erreur général, avec en option un lien de secours vers la messagerie (demande pré-remplie).
  const showAlert = (text: string, mailto?: string) => {
    if (!alertBox) return;
    alertBox.textContent = text;
    if (mailto) {
      const link = document.createElement('a');
      link.href = mailto;
      link.textContent = 'Envoyer ma demande par e-mail';
      link.style.cssText = 'color:inherit;text-decoration:underline';
      alertBox.append(' ', link);
    }
    alertBox.hidden = !text;
  };

  // Confirmation de la maquette : « Merci {prénom}, c'est noté. » à la place du formulaire.
  const showSuccess = (firstName: string) => {
    bindAll(form, { formOpen: false, formSent: true, formName: firstName });
    const done = form.querySelector<HTMLElement>('[data-form-success]');
    done?.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAlert('');

    let firstInvalid: HTMLInputElement | null = null;
    for (const { name, test } of rules) {
      const input = el(name);
      if (!input) continue;
      const ok = test(input.value.trim());
      setError(input, !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(
      Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v).trim()]),
    ) as Record<string, string>;
    // Services : un seul (page de service) ou plusieurs cases cochées (formulaire général).
    const services = new FormData(form).getAll('service').map(String).filter(Boolean);
    if (services.length) data.service = services.join(', ');
    else delete data.service;
    const firstName = (data.nom || '').split(/\s+/)[0] || '';

    // Champ piège rempli : on simule un succès sans rien envoyer.
    if (data.site_web) {
      form.reset();
      showSuccess(firstName);
      return;
    }
    delete data.site_web;

    let lastSent = 0;
    try {
      lastSent = Number(sessionStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
      /* stockage indisponible */
    }
    if (Date.now() - lastSent < COOLDOWN_MS) {
      showAlert('Votre demande vient d’être envoyée. Patientez quelques secondes avant d’en envoyer une autre.');
      return;
    }

    const subject = `Demande d’audit${data.service ? ` (${data.service})` : ''} — ${data.nom}${data.entreprise ? ` (${data.entreprise})` : ''}`;
    const lines = [
      ...(data.service ? [`Service : ${data.service}`] : []),
      `Nom : ${data.nom}`,
      `Téléphone : ${data.tel}`,
      `Entreprise : ${data.entreprise || '-'}`,
      `Métier : ${data.metier || '-'}`,
      '',
      data.message || '',
    ];
    const mailto = `mailto:${inbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

    // Envoi désactivé (PUBLIC_CONTACT_ENDPOINT vide) : la messagerie du visiteur s'ouvre, demande pré-remplie.
    if (!endpoint) {
      window.location.href = mailto;
      showSuccess(firstName);
      return;
    }

    submitBtn?.setAttribute('disabled', '');
    submitBtn?.setAttribute('aria-busy', 'true');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, page: window.location.href }),
      });
      if (res.status === 400) {
        // Champ refusé par le serveur (filet de sécurité, mêmes règles) : erreur sous le champ concerné.
        const body = await res.json().catch(() => ({}));
        const refused = rules.filter(({ name }) => body?.errors?.[name]);
        if (refused.length) {
          refused.forEach(({ name }) => {
            const input = el(name);
            if (input) setError(input, true);
          });
          el(refused[0].name)?.focus();
          return;
        }
      }
      if (!res.ok) throw new Error(String(res.status));
      try {
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* stockage indisponible */
      }
      form.reset();
      showSuccess(firstName);
      track('form_submit', { page: window.location.pathname, ...(data.service ? { service: data.service } : {}) });
    } catch {
      showAlert(
        `L’envoi n’a pas abouti. Réessayez dans un instant, appelez le ${phone}, ou envoyez-la par e-mail :`,
        mailto,
      );
    } finally {
      submitBtn?.removeAttribute('disabled');
      submitBtn?.removeAttribute('aria-busy');
    }
  });
}
