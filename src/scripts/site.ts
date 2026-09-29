/**
 * Comportements communs à toutes les pages (repris de la logique de la maquette) :
 * en-tête qui se densifie au défilement, menus, apparitions au défilement, filets de section,
 * événements de mesure d'audience.
 */
import { track } from './track';

const root = document.querySelector<HTMLElement>('.vp-root');
const header = document.querySelector<HTMLElement>('[data-header]');

/* ---------- En-tête : fond densifié après 6 px de défilement ---------- */
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 6);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Menus (burger mobile, sous-menu Services) ---------- */
const setOpen = (btn: HTMLElement, panel: HTMLElement | null, open: boolean) => {
  btn.setAttribute('aria-expanded', String(open));
  if (panel) panel.hidden = !open;
};

const menuBtn = document.querySelector<HTMLElement>('[data-menu-toggle]');
const menu = document.getElementById('menu-mobile');
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  setOpen(menuBtn, menu, open);
  if (!open) closeServices();
});

const svcButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-svc-toggle]'));
const panelOf = (btn: HTMLElement) => document.getElementById(btn.getAttribute('aria-controls') || '');
function closeServices() {
  svcButtons.forEach((b) => setOpen(b, panelOf(b), false));
}
svcButtons.forEach((btn) =>
  btn.addEventListener('click', () => setOpen(btn, panelOf(btn), btn.getAttribute('aria-expanded') !== 'true')),
);

// Sous-menu desktop : fermeture au clic extérieur, à Échap et quand le focus en sort.
const svcWrap = document.querySelector<HTMLElement>('[data-svc]');
document.addEventListener(
  'mousedown',
  (e) => {
    if (svcWrap && !svcWrap.contains(e.target as Node)) {
      const btn = svcWrap.querySelector<HTMLElement>('[data-svc-toggle]');
      if (btn) setOpen(btn, panelOf(btn), false);
    }
  },
  true,
);
svcWrap?.addEventListener('focusout', (e) => {
  if (!svcWrap.contains(e.relatedTarget as Node | null)) {
    const btn = svcWrap.querySelector<HTMLElement>('[data-svc-toggle]');
    if (btn) setOpen(btn, panelOf(btn), false);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const openBtn = [...svcButtons, ...(menuBtn ? [menuBtn] : [])].find(
    (b) => b.getAttribute('aria-expanded') === 'true',
  );
  if (!openBtn) return;
  closeServices();
  if (menuBtn) setOpen(menuBtn, menu, false);
  openBtn.focus();
});

// Passage mobile <-> desktop : on referme tout, comme la maquette.
if (root && 'ResizeObserver' in window) {
  let narrow: boolean | null = null;
  new ResizeObserver(([entry]) => {
    const w = entry.contentRect.width;
    const next = w > 0 && w < 900;
    if (narrow !== null && next !== narrow) {
      closeServices();
      if (menuBtn) setOpen(menuBtn, menu, false);
    }
    narrow = next;
  }).observe(root);
}

/* ---------- Apparitions au défilement ---------- */
if ('IntersectionObserver' in window) {
  const revealIo = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIo.unobserve(e.target);
      }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  document.querySelectorAll<HTMLElement>('[data-vp-reveal]').forEach((el) => {
    const i = parseInt(el.dataset.vpReveal || '0', 10) || 0;
    el.style.setProperty('--vp-delay', `${i * 110}ms`);
    revealIo.observe(el);
  });

  const sepIo = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('is-in');
        window.setTimeout(() => el.classList.add('is-done'), 1100);
        sepIo.unobserve(el);
      }),
    { threshold: 0, rootMargin: '0px 0px -30% 0px' },
  );
  document.querySelectorAll('[data-vp-sep]').forEach((el) => sepIo.observe(el));
} else {
  document.querySelectorAll('[data-vp-reveal], [data-vp-sep]').forEach((el) => el.classList.add('is-in', 'is-done'));
}

/* ---------- Mesure d'audience ---------- */
document.addEventListener('click', (e) => {
  const el = (e.target as Element | null)?.closest?.('a, button');
  if (!el) return;
  if (el.hasAttribute('data-cta')) track('audit_cta_click', { page: location.pathname });
  const href = el.getAttribute('href') || '';
  if (href.startsWith('tel:')) track('tel_click', { page: location.pathname });
});
