/**
 * Couche d'animations légère, ajoutée à celles de la maquette :
 * - apparition des sections au défilement (fondu + montée de 14 px, cartes en cascade) ;
 * - chiffres des simulateurs qui se construisent à leur apparition.
 * Rien ne bouge si le visiteur a demandé à réduire les animations. Le premier écran garde ses
 * propres animations d'entrée (maquette) : il n'est jamais masqué, pour ne pas retarder l'affichage.
 * Seules opacity et translate changent : aucun décalage de mise en page.
 */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STEP_MS = 90; // décalage entre deux éléments voisins
const MAX_STEPS = 5;

/* ---------- Apparition au défilement ---------- */
if (!reduce && 'IntersectionObserver' in window) {
  const items: { el: HTMLElement; delay: number }[] = [];
  const seen = new Set<HTMLElement>();

  // On n'anime pas ce qui a déjà sa propre animation, sa propre opacité ou une position absolue
  // (cartes du carrousel, éléments décoratifs), ni ce qui est déjà visible au chargement.
  const animatable = (el: HTMLElement) => {
    if (seen.has(el) || el.style.opacity || el.style.animation) return false;
    const cs = getComputedStyle(el);
    return (
      cs.position !== 'absolute' && cs.position !== 'fixed' && cs.display !== 'none' && cs.animationName === 'none'
    );
  };
  const add = (el: HTMLElement, i: number, base = 0) => {
    if (!animatable(el)) return;
    seen.add(el);
    items.push({ el, delay: base + Math.min(i, MAX_STEPS) * STEP_MS });
  };
  // Grille de cartes : au moins 3 enfants arrondis côte à côte.
  const isCardGrid = (el: Element) => {
    const kids = Array.from(el.children) as HTMLElement[];
    if (kids.length < 3) return false;
    const d = getComputedStyle(el).display;
    if (!/flex|grid/.test(d)) return false;
    return kids.every((k) => parseFloat(getComputedStyle(k).borderTopLeftRadius) >= 16);
  };

  document.querySelectorAll<HTMLElement>('main section').forEach((section, index) => {
    if (index === 0) return;
    const container = section.firstElementChild as HTMLElement | null;
    if (!container) return;
    // Blocs principaux de la section (titre, contenu, encadré…), l'un après l'autre.
    Array.from(container.children).forEach((block, i) => add(block as HTMLElement, i));
    // Puis les cartes, en cascade.
    section.querySelectorAll<HTMLElement>('div, ul').forEach((el) => {
      if (isCardGrid(el)) Array.from(el.children).forEach((card, i) => add(card as HTMLElement, i, 120));
    });
  });

  const vh = window.innerHeight;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        el.classList.add('vp-in');
        // Fin de l'apparition : on retire nos classes, les transitions de la maquette (survols) reprennent.
        window.setTimeout(
          () => el.classList.remove('vp-rv', 'vp-in'),
          900 + parseInt(el.style.getPropertyValue('--vp-d') || '0', 10),
        );
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  for (const { el, delay } of items) {
    if (el.getBoundingClientRect().top < vh) continue; // déjà à l'écran : pas d'effet
    el.style.setProperty('--vp-d', delay + 'ms');
    el.classList.add('vp-rv');
    io.observe(el);
  }
}

/* ---------- Chiffres qui se construisent ---------- */
/**
 * Anime de 0 à la valeur affichée le nombre contenu dans un résultat de simulateur
 * (« 20 076 € », « 43 h »…), au premier passage à l'écran. S'arrête si le visiteur bouge un curseur.
 */
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        countUp(e.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => io.observe(el));
}

function countUp(el: HTMLElement) {
  const text = el.textContent || '';
  const m = text.match(/\d[\d\s  ]*/);
  if (!m) return;
  const raw = m[0].replace(/\s+$/, '');
  const target = Number(raw.replace(/[^\d]/g, ''));
  if (!target) return;
  const sep = raw.match(/[\s  ]/)?.[0] ?? ' ';
  const before = text.slice(0, m.index);
  const after = text.slice((m.index ?? 0) + raw.length);
  const format = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const duration = 900;
  const t0 = performance.now();
  let last = text;
  const frame = (t: number) => {
    if (el.textContent !== last) return; // valeur changée par le simulateur : on s'arrête
    const p = Math.min(1, (t - t0) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    last = p < 1 ? before + format(Math.round(target * eased)) + after : text;
    el.textContent = last;
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------- Éventail des sites (carte « Être trouvé ») sur écran tactile ---------- */
// Sans survol possible, l'éventail s'ouvre quand la carte est bien visible et se referme en la quittant.
if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-open', e.isIntersecting)),
    { threshold: 0.6 },
  );
  document.querySelectorAll('[data-fan]').forEach((el) => io.observe(el));
}
