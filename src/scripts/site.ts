/**
 * Comportements communs à toutes les pages (repris de la logique de la maquette) :
 * en-tête qui se densifie au défilement, menus, apparitions au défilement, filets de section,
 * décompte des chiffres clés, événements de mesure d'audience.
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
// Le bouton burger devient une croix : son libellé suit (« Ouvrir » / « Fermer le menu »).
const setMenu = (open: boolean) => {
  if (!menuBtn) return;
  setOpen(menuBtn, menu, open);
  menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
};
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  setMenu(open);
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
  setMenu(false);
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
      setMenu(false);
    }
    narrow = next;
  }).observe(root);
}

/* ---------- Apparitions au défilement ---------- */
// data-vp-reveal="n" : délai de n × 110 ms, écrit en CSS (maquette). data-vp-reveal sans valeur : les éléments
// qui arrivent ensemble à l'écran sont décalés de 90 ms chacun. data-vp-inview : le bloc reçoit seulement la
// classe is-in (ses enfants s'animent en CSS), dès que son haut entre dans l'écran.
const STAGGER_MS = 90;
if ('IntersectionObserver' in window) {
  const revealIo = new IntersectionObserver(
    (entries) => {
      let k = 0;
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        if (el.dataset.vpReveal === '') el.style.setProperty('--vp-delay', `${Math.min(k++, 5) * STAGGER_MS}ms`);
        el.classList.add('is-in');
        revealIo.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  document.querySelectorAll('[data-vp-reveal]').forEach((el) => revealIo.observe(el));

  const inviewIo = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        inviewIo.unobserve(e.target);
      }),
    { threshold: 0, rootMargin: '0px 0px -12% 0px' },
  );
  document.querySelectorAll('[data-vp-inview]').forEach((el) => inviewIo.observe(el));

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
  document
    .querySelectorAll('[data-vp-reveal], [data-vp-inview], [data-vp-sep]')
    .forEach((el) => el.classList.add('is-in', 'is-done'));
}

/* ---------- Chiffres clés : décompte à l'apparition ---------- */
// <span data-vp-count="30">30</span> : le chiffre final reste écrit dans le HTML (lecture sans JS, référencement).
const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-vp-count]'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
  const easeOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const count = (el: HTMLElement) => {
    const target = Number(el.dataset.vpCount) || 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = String(Math.round(target * easeOut(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countIo = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIo.unobserve(e.target);
        count(e.target as HTMLElement);
      }),
    { threshold: 0.6 },
  );
  counters.forEach((el) => {
    // Largeur réservée à la valeur finale : le décompte ne décale pas le texte voisin.
    el.style.display = 'inline-block';
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    el.style.textAlign = 'right';
    el.textContent = '0';
    countIo.observe(el);
  });
}

/* ---------- Mesure d'audience ---------- */
document.addEventListener('click', (e) => {
  const el = (e.target as Element | null)?.closest?.('a, button');
  if (!el) return;
  if (el.hasAttribute('data-cta')) track('audit_cta_click', { page: location.pathname });
  const href = el.getAttribute('href') || '';
  if (href.startsWith('tel:')) track('tel_click', { page: location.pathname });
});
