/**
 * Couche de mouvement « dynamique » (ajout au vocabulaire de la maquette) :
 * - titres de section (h2) qui apparaissent mot par mot quand ils arrivent à l'écran ;
 * - hero de l'accueil : la carte « Diagnostic » s'incline vers le pointeur, un halo orange le suit ;
 * - boutons d'audit « magnétiques » : ils glissent de quelques pixels vers le pointeur.
 * Tout est désactivé avec « réduire les animations » ; les effets de pointeur ne concernent que la souris
 * ou le trackpad (pointer: fine). Les pages préchargées en arrière-plan (Speculation Rules) n'animent rien
 * avant d'être réellement affichées : voir whenActivated().
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Exécute fn quand la page est affichée : tout de suite, ou à l'activation d'une page préchargée. */
export function whenActivated(fn: () => void) {
  if ((document as Document & { prerendering?: boolean }).prerendering)
    document.addEventListener('prerenderingchange', fn, { once: true });
  else fn();
}

/* ---------- Titres mot par mot ---------- */
// Chaque mot est enveloppé dans <span class="vp-w" style="--wi:n"> (nœuds texte seulement : les <span> de
// couleur et les <br> restent en place). Le titre reçoit is-in à l'écran ; la transition est en CSS.
const MAX_WORD_INDEX = 12;

function splitWords(heading: HTMLElement) {
  let i = 0;
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const parts = (node.nodeValue ?? '').split(/(\s+)/);
    if (parts.every((p) => !p.trim())) return;
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (!part.trim()) {
        frag.append(part);
        return;
      }
      const w = document.createElement('span');
      w.className = 'vp-w';
      w.style.setProperty('--wi', String(Math.min(i++, MAX_WORD_INDEX)));
      w.textContent = part;
      frag.append(w);
    });
    node.replaceWith(frag);
  });
  heading.classList.add('vp-split');
}

export function initHeadings() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const headings = Array.from(document.querySelectorAll<HTMLElement>('main h2'));
  // Titres déjà à l'écran au chargement (haut de page) : laissés tels quels, pour ne pas les faire clignoter.
  const vh = window.innerHeight;
  const below = headings.filter((h) => h.getBoundingClientRect().top > vh * 0.9 || h.closest('[hidden]'));
  below.forEach(splitWords);
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }),
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
  );
  below.forEach((h) => io.observe(h));
}

/* ---------- Effets de pointeur ---------- */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hero : inclinaison 3D de [data-vp-tilt] et halo .vp-spot qui suivent le pointeur. */
function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-vp-hero]');
  const tilt = hero?.querySelector<HTMLElement>('[data-vp-tilt]');
  const spot = hero?.querySelector<HTMLElement>('.vp-spot');
  if (!hero || !tilt) return;

  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  let raf = 0;

  const frame = () => {
    cur.x = lerp(cur.x, target.x, 0.09);
    cur.y = lerp(cur.y, target.y, 0.09);
    tilt.style.transform = `perspective(1100px) rotateX(${(-cur.y * 5).toFixed(3)}deg) rotateY(${(cur.x * 7).toFixed(3)}deg)`;
    if (Math.abs(cur.x - target.x) > 0.001 || Math.abs(cur.y - target.y) > 0.001) raf = requestAnimationFrame(frame);
    else {
      raf = 0;
      if (!target.x && !target.y) tilt.style.transform = '';
    }
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  hero.addEventListener(
    'pointermove',
    (e) => {
      const r = hero.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (spot) {
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
        spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      hero.classList.add('is-pointer');
      kick();
    },
    { passive: true },
  );
  hero.addEventListener('pointerleave', () => {
    target.x = 0;
    target.y = 0;
    hero.classList.remove('is-pointer');
    kick();
  });
}

/** Boutons d'audit ([data-cta]) : glissent vers le pointeur (au plus 8 × 5 px), reviennent en douceur. */
function initMagnetic() {
  document.querySelectorAll<HTMLElement>('[data-cta]').forEach((btn) => {
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const frame = () => {
      cur.x = lerp(cur.x, target.x, 0.18);
      cur.y = lerp(cur.y, target.y, 0.18);
      const settled = Math.abs(cur.x - target.x) < 0.05 && Math.abs(cur.y - target.y) < 0.05;
      btn.style.translate = settled && !target.x && !target.y ? '' : `${cur.x.toFixed(2)}px ${cur.y.toFixed(2)}px`;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    btn.addEventListener(
      'pointermove',
      (e) => {
        const r = btn.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 16;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 10;
        kick();
      },
      { passive: true },
    );
    btn.addEventListener('pointerleave', () => {
      target.x = 0;
      target.y = 0;
      kick();
    });
  });
}

export function initPointerEffects() {
  if (reduceMotion || !finePointer) return;
  initHero();
  initMagnetic();
}
