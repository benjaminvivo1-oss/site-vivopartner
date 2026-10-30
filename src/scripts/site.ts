/**
 * Comportements communs à toutes les pages, repris de la logique de la maquette v3 :
 * en-tête qui change de fond au défilement, menu Services, menu mobile,
 * défilement vers les leviers, événements de mesure d'audience.
 */
import { track } from './track';
import './motion';

/* ---------- En-tête : fond translucide après 6 px de défilement (valeurs de la maquette) ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  let scrolled: boolean | null = null;
  const onScroll = () => {
    const next = window.scrollY > 6;
    if (next === scrolled) return;
    scrolled = next;
    header.style.background = next ? 'rgba(15,23,42,.68)' : '#0B2F6B';
    const blur = next ? 'saturate(180%) blur(22px)' : 'none';
    header.style.backdropFilter = blur;
    header.style.setProperty('-webkit-backdrop-filter', blur);
    header.style.borderBottomColor = next ? 'rgba(248,250,252,.14)' : 'rgba(248,250,252,0)';
    header.style.boxShadow = next ? '0 12px 30px rgba(6,20,48,.28)' : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- Menu Services (ordinateur) et menu mobile ---------- */
const panelOf = (btn: HTMLElement) => document.getElementById(btn.getAttribute('aria-controls') || '');
const setOpen = (btn: HTMLElement, open: boolean) => {
  btn.setAttribute('aria-expanded', String(open));
  const panel = panelOf(btn);
  if (panel) panel.hidden = !open;
  // Ordinateur : le mot « Services » passe en orange et la flèche se retourne.
  const caret = btn.querySelector<HTMLElement>('[data-svc-caret]');
  if (caret) {
    btn.style.color = open ? '#F58220' : 'inherit';
    caret.style.transform = open ? 'rotate(225deg) translate(-1px,-1px)' : 'rotate(45deg) translate(-1px,-1px)';
  }
};

const svcButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-svc-toggle]'));
svcButtons.forEach((btn) =>
  btn.addEventListener('click', () => setOpen(btn, btn.getAttribute('aria-expanded') !== 'true')),
);

const svcWrap = document.querySelector<HTMLElement>('[data-svc]');
const svcDesktop = svcWrap?.querySelector<HTMLElement>('[data-svc-toggle]');
if (svcWrap && svcDesktop) {
  // Fermeture au clic en dehors (comme la maquette), à Échap et quand le focus sort du menu.
  document.addEventListener(
    'mousedown',
    (e) => {
      if (svcDesktop.getAttribute('aria-expanded') === 'true' && !svcWrap.contains(e.target as Node))
        setOpen(svcDesktop, false);
    },
    true,
  );
  svcWrap.addEventListener('focusout', (e) => {
    if (!svcWrap.contains(e.relatedTarget as Node | null)) setOpen(svcDesktop, false);
  });
}

const menuBtn = document.querySelector<HTMLElement>('[data-menu-toggle]');
const setMenu = (open: boolean) => {
  if (!menuBtn) return;
  setOpen(menuBtn, open);
  menuBtn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  if (!open) svcButtons.forEach((b) => b !== svcDesktop && setOpen(b, false));
};
menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (svcDesktop?.getAttribute('aria-expanded') === 'true') {
    setOpen(svcDesktop, false);
    svcDesktop.focus();
  } else if (menuBtn?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuBtn.focus();
  }
});

// Au passage en version ordinateur, le menu mobile se referme (comme la maquette au redimensionnement).
const root = document.querySelector<HTMLElement>('.vp-root');
if (root && 'ResizeObserver' in window) {
  let narrow: boolean | null = null;
  new ResizeObserver(([entry]) => {
    const next = entry.contentRect.width < 900;
    if (narrow !== null && next !== narrow) {
      setMenu(false);
      if (svcDesktop) setOpen(svcDesktop, false);
    }
    narrow = next;
  }).observe(root);
}

/* ---------- « Découvrir les 3 leviers » : défilement doux, 64 px sous l'en-tête ---------- */
document.querySelectorAll<HTMLAnchorElement>('[data-on-click="scrollLevers"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const target = document.getElementById('leviers');
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top - 64,
      behavior: reduce ? 'auto' : 'smooth',
    });
    history.replaceState(null, '', '#leviers');
  }),
);

/* ---------- Mesure d'audience ---------- */
document.addEventListener('click', (e) => {
  const link = (e.target as Element | null)?.closest?.('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  if (href.startsWith('tel:')) track('tel_click');
  else if (href.startsWith('/contact/') || href === '#contact' || link.hasAttribute('data-cta'))
    track('audit_cta_click');
});
