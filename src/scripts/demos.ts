/**
 * Démos interactives (accueil, /aplomb/, /receptionniste-ia/), reprise de la machine d'états de la maquette :
 * - onglets de l'accueil : rotation toutes les 11 s ;
 * - réceptionniste IA : une étape toutes les 1,9 s ;
 * - Aplomb : un écran toutes les 4,2 s (sur l'accueil, seulement quand l'onglet Aplomb est affiché).
 * Le premier clic arrête la lecture automatique (comme la maquette). En plus, pour l'accessibilité :
 * pause au survol et au focus, bouton pause/lecture, pas de lecture automatique si l'utilisateur
 * a demandé à réduire les animations, arrêt quand l'onglet du navigateur est masqué.
 *
 * Balisage attendu dans un conteneur [data-demos] :
 * - [data-if="flag"]      élément affiché si le drapeau est vrai (hidden sinon) ;
 * - [data-text="clé"]     texte remplacé ;
 * - [data-pressed="flag"] bouton dont aria-pressed suit le drapeau ;
 * - [data-action="nom"]   bouton déclenchant une action ;
 * - [role=tab][data-tab] / [role=tabpanel][data-tab-panel] pour les onglets.
 */
import { APLOMB_SCREENS, IA_STATUS, TIMING } from './demo-data';

type Flags = Record<string, boolean | string>;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-demos]').forEach(initDemos);

function initDemos(root: HTMLElement) {
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('[role="tab"][data-tab]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"][data-tab-panel]'));
  const hasTabs = tabs.length > 0;
  const hasIa = !!root.querySelector('[data-demo-ia]');
  const hasAplomb = !!root.querySelector('[data-demo-aplomb]');

  const ifs = Array.from(root.querySelectorAll<HTMLElement>('[data-if]'));
  const texts = Array.from(root.querySelectorAll<HTMLElement>('[data-text]'));
  const pressed = Array.from(root.querySelectorAll<HTMLElement>('[data-pressed]'));
  const convs = Array.from(root.querySelectorAll<HTMLElement>('[data-conv]'));
  const pauseBtns = Array.from(root.querySelectorAll<HTMLElement>('[data-action="togglePause"]'));
  const live = root.querySelector<HTMLElement>('[data-live]');

  const state = {
    tab: 0,
    auto: !reducedMotion, // onglets + étapes IA
    demo: 1,
    ap: 0,
    apAuto: !reducedMotion,
    paused: false, // bouton pause
    hover: false,
    focus: false,
  };

  // Lecture automatique effective (ce que l'utilisateur voit bouger).
  const playing = () =>
    !state.paused &&
    (((hasTabs || hasIa) && state.auto) || (hasAplomb && state.apAuto && (!hasTabs || state.tab === 0)));
  const running = () => playing() && !state.hover && !state.focus && !document.hidden;

  function flags(): Flags {
    const f: Flags = {};
    for (let i = 1; i <= 6; i++) {
      f[`d${i}`] = state.demo >= i;
      f[`dn${i}`] = state.demo < i;
      f[`da${i}`] = state.demo === i;
    }
    for (let i = 0; i < APLOMB_SCREENS; i++) f[`ap${i}`] = state.ap === i;
    f.dStatus = IA_STATUS[state.demo];
    f.dNextLabel = state.demo >= 6 ? 'Rejouer la démo' : 'Étape suivante →';
    return f;
  }

  function render() {
    const f = flags();
    ifs.forEach((el) => {
      const show = !!f[el.dataset.if as string];
      if (el.hidden === show) el.hidden = !show;
    });
    texts.forEach((el) => {
      const t = String(f[el.dataset.text as string] ?? '');
      if (el.textContent !== t) el.textContent = t;
    });
    pressed.forEach((el) => el.setAttribute('aria-pressed', String(!!f[el.dataset.pressed as string])));
    tabs.forEach((t, i) => {
      const selected = i === state.tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((p, i) => {
      const show = i === state.tab;
      if (p.hidden === show) p.hidden = !show;
    });
    const isPlaying = playing();
    pauseBtns.forEach((b) => {
      const label = isPlaying ? 'Mettre la démo en pause' : 'Relancer la démo';
      b.setAttribute('aria-label', label);
      b.title = label;
      b.querySelector<SVGElement>('[data-icon="pause"]')?.toggleAttribute('hidden', !isPlaying);
      b.querySelector<SVGElement>('[data-icon="play"]')?.toggleAttribute('hidden', isPlaying);
      const text = b.querySelector<HTMLElement>('[data-pause-label]');
      if (text) text.textContent = isPlaying ? 'Pause' : 'Lecture';
    });
    // Comme la maquette : la conversation défile jusqu'au dernier message.
    requestAnimationFrame(() =>
      convs.forEach((el) => {
        const top = el.scrollHeight - el.clientHeight;
        if (top > 0) el.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      }),
    );
  }

  function announce() {
    if (live && hasIa) live.textContent = IA_STATUS[state.demo];
  }

  function selectTab(i: number, focus = false) {
    state.tab = (i + tabs.length) % tabs.length;
    state.auto = false;
    render();
    if (focus) tabs[state.tab]?.focus();
  }

  const actions: Record<string, () => void> = {
    tabPrev: () => {
      state.tab = (state.tab + 2) % 3;
      state.auto = false;
      state.demo = 1;
    },
    tabNext: () => {
      state.tab = (state.tab + 1) % 3;
      state.auto = false;
      state.demo = 1;
    },
    dNext: () => {
      state.auto = false;
      state.demo = state.demo >= 6 ? 1 : state.demo + 1;
      announce();
    },
    togglePause: () => {
      if (playing()) {
        state.paused = true;
      } else {
        state.paused = false;
        state.auto = true;
        state.apAuto = true;
      }
    },
  };
  for (let i = 1; i <= 6; i++)
    actions[`dGo${i}`] = () => {
      state.demo = i;
      state.auto = false;
      announce();
    };
  for (let i = 0; i < APLOMB_SCREENS; i++)
    actions[`apGo${i}`] = () => {
      state.ap = i;
      state.apAuto = false;
    };

  root.addEventListener('click', (e) => {
    const target = e.target as Element;
    const tab = target.closest<HTMLElement>('[role="tab"][data-tab]');
    if (tab && root.contains(tab)) {
      selectTab(Number(tab.dataset.tab));
      return;
    }
    const btn = target.closest<HTMLElement>('[data-action]');
    if (!btn || !root.contains(btn)) return;
    const action = actions[btn.dataset.action as string];
    if (!action) return;
    action();
    render();
  });

  // Onglets : flèches, Début, Fin (activation automatique).
  root.addEventListener('keydown', (e) => {
    const tab = (e.target as Element).closest?.('[role="tab"][data-tab]');
    if (!tab) return;
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (e.key in keys) selectTab(state.tab + keys[e.key], true);
    else if (e.key === 'Home') selectTab(0, true);
    else if (e.key === 'End') selectTab(tabs.length - 1, true);
    else return;
    e.preventDefault();
  });

  // Pause au survol (souris) et au focus clavier.
  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') state.hover = true;
  });
  root.addEventListener('pointerleave', () => {
    state.hover = false;
  });
  root.addEventListener('focusin', () => {
    state.focus = true;
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) state.focus = false;
  });

  if (hasTabs)
    window.setInterval(() => {
      if (!state.auto || !running()) return;
      state.tab = (state.tab + 1) % 3;
      state.demo = 1;
      render();
    }, TIMING.tab);

  if (hasIa)
    window.setInterval(() => {
      if (!state.auto || !running()) return;
      state.demo = state.demo >= 6 ? 1 : state.demo + 1;
      render();
    }, TIMING.iaStep);

  if (hasAplomb)
    window.setInterval(() => {
      if (!state.apAuto || !running()) return;
      if (hasTabs && state.tab !== 0) return;
      state.ap = (state.ap + 1) % APLOMB_SCREENS;
      render();
    }, TIMING.aplombScreen);

  render();
}
