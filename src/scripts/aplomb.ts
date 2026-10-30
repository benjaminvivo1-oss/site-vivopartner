/**
 * Simulateur de la page Aplomb : mêmes formules et libellés que la maquette (PageAplomb, _rv()).
 * Résultats en nombres entiers.
 */
import { bindAll, onAll } from './bind';

const scope = document.querySelector('main');
if (scope) {
  const s = { n: 20, v: 4000, p: 30, h: 6, q: 10, y: 30 };
  const fmt = (x: number) => Math.round(x).toLocaleString('fr-FR').replace(/ | /g, ' ');
  const rnd = (x: number) => {
    const st = x >= 100000 ? 500 : x >= 2000 ? 100 : x >= 200 ? 10 : 1;
    return Math.round(x / st) * st;
  };

  const render = () => {
    const rec = s.n * (s.p / 100) * (s.q / 100);
    const ca = rec * s.v * 12;
    const hm = s.h * (s.y / 100) * 4.3;
    const j = hm / 7;
    bindAll(scope, {
      v_n: String(s.n),
      v_v: String(s.v),
      v_p: String(s.p),
      v_h: String(s.h),
      l_n: s.n + ' devis',
      l_v: fmt(s.v) + ' €',
      l_p: s.p + ' %',
      l_h: s.h + ' h',
      r_dev: fmt(rec * 12),
      r_ca: fmt(rnd(ca)) + ' €',
      r_h: fmt(hm) + ' h',
      r_s: j >= 1.5 ? fmt(j) + ' jours' : j >= 1 ? '1 jour' : Math.round(hm * 12) * 5 + ' min',
    });
  };

  const set = (k: keyof typeof s) => (_e: Event, el: HTMLElement) => {
    const x = Number((el as HTMLInputElement).value);
    if (!isNaN(x)) {
      s[k] = x;
      render();
    }
  };
  const handlers = { on_n: set('n'), on_v: set('v'), on_p: set('p'), on_h: set('h') };
  // La maquette écoute « input » et « change » ; un seul écouteur « input » suffit.
  onAll(scope, 'input', handlers);
  scope.querySelectorAll<HTMLInputElement>('input[data-on-input]').forEach((input) => {
    const k = (input.dataset.onInput || '').slice(3) as keyof typeof s;
    if (k in s && input.value) s[k] = Number(input.value);
  });
  render();

  // Animations réduites : la maquette rend les bandeaux d'outils défilables à la main ;
  // on les rend aussi atteignables au clavier.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    scope.querySelectorAll<HTMLElement>('.mqr').forEach((row) => row.setAttribute('tabindex', '0'));
}
