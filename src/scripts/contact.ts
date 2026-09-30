/**
 * Formulaire de demande d'audit : validation accessible (erreur sous le champ, aria-invalid,
 * focus sur le premier champ en erreur), anti-spam (champ piège + délai entre deux envois),
 * envoi JSON vers PUBLIC_CONTACT_ENDPOINT, confirmation annoncée (role="status").
 */
import { track } from './track';

const COOLDOWN_MS = 30_000;
const STORAGE_KEY = 'vp-audit-sent-at';

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) initForm(form);

function initForm(form: HTMLFormElement) {
  form.noValidate = true; // la validation native reste active sans JavaScript
  const endpoint = form.dataset.endpoint || '';
  const inbox = form.dataset.email || '';
  const phone = form.dataset.phone || '';
  const alertBox = form.querySelector<HTMLElement>('[data-form-error]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submitLabel = form.querySelector<HTMLElement>('[data-submit-label]');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const el = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;

  const rules: { name: string; error: string; test: (v: string, input: HTMLInputElement) => boolean }[] = [
    { name: 'nom', error: 'err-nom', test: (v) => v.length > 0 },
    { name: 'tel', error: 'err-tel', test: (v) => v.replace(/[^0-9+]/g, '').length >= 9 },
    { name: 'email', error: 'err-email', test: (v) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) },
    { name: 'consentement', error: 'err-consent', test: (_v, input) => input.checked },
  ];

  const setError = (input: HTMLInputElement, errorId: string, invalid: boolean) => {
    const msg = document.getElementById(errorId);
    if (msg) msg.hidden = !invalid;
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  // L'erreur disparaît dès que le champ est corrigé.
  rules.forEach(({ name, error, test }) => {
    const input = el(name);
    input?.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
      if (input.getAttribute('aria-invalid') === 'true') setError(input, error, !test(input.value.trim(), input));
    });
  });

  const showAlert = (text: string) => {
    if (!alertBox) return;
    alertBox.textContent = text;
    alertBox.hidden = !text;
  };

  const showSuccess = (firstName: string, text?: string) => {
    if (!status) return;
    const title = status.querySelector<HTMLElement>('[data-status-title]');
    const body = status.querySelector<HTMLElement>('[data-status-text]');
    if (title) title.textContent = firstName ? `Demande reçue, merci ${firstName}.` : 'Demande reçue, merci.';
    if (body && text) body.textContent = text;
    status.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showAlert('');
    if (status) status.hidden = true;

    let firstInvalid: HTMLInputElement | null = null;
    for (const { name, error, test } of rules) {
      const input = el(name);
      if (!input) continue;
      const ok = test(input.value.trim(), input);
      setError(input, error, !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(
      Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v).trim()]),
    ) as Record<string, string>;
    const firstName = (data.nom || '').split(/\s+/)[0] || '';

    // Champ piège rempli : on simule un succès sans rien envoyer.
    if (data.site_web) {
      showSuccess(firstName);
      form.reset();
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

    const subject = `Demande d’audit — ${data.nom}${data.entreprise ? ` (${data.entreprise})` : ''}`;

    // Pas de point d'envoi configuré : la messagerie du visiteur s'ouvre avec la demande pré-remplie.
    if (!endpoint) {
      const lines = [
        `Nom : ${data.nom}`,
        `Entreprise : ${data.entreprise || '-'}`,
        `Secteur : ${data.secteur || '-'}`,
        `Téléphone : ${data.tel}`,
        `E-mail : ${data.email || '-'}`,
        '',
        data.message || '',
      ];
      window.location.href = `mailto:${inbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      showSuccess(
        firstName,
        `Votre messagerie s’ouvre avec votre demande pré-remplie : il ne reste qu’à l’envoyer. Sinon, écrivez directement à ${inbox}.`,
      );
      return;
    }

    submitBtn?.setAttribute('disabled', '');
    submitBtn?.setAttribute('aria-busy', 'true');
    const label = submitLabel?.textContent;
    if (submitLabel) submitLabel.textContent = 'Envoi en cours…';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, _subject: subject, page: window.location.href }),
      });
      if (!res.ok) throw new Error(String(res.status));
      try {
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* stockage indisponible */
      }
      form.reset();
      showSuccess(firstName);
      track('form_submit', { page: window.location.pathname });
    } catch {
      showAlert(`L’envoi n’a pas abouti. Réessayez dans un instant, ou écrivez à ${inbox} / appelez le ${phone}.`);
    } finally {
      submitBtn?.removeAttribute('disabled');
      submitBtn?.removeAttribute('aria-busy');
      if (submitLabel && label) submitLabel.textContent = label;
    }
  });
}
