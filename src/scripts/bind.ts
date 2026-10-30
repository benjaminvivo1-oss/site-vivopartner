/**
 * Met à jour les éléments marqués data-bind="cible:nom;…" (repris des {{ nom }} de la maquette) :
 * text (contenu), if (affiché ou masqué), value (champ), ou n'importe quel attribut (style, aria-…).
 */
export type Vals = Record<string, string | number | boolean>;

export function bindAll(scope: ParentNode, vals: Vals) {
  scope.querySelectorAll<HTMLElement>('[data-bind]').forEach((el) => {
    for (const part of (el.dataset.bind || '').split(';')) {
      const i = part.indexOf(':');
      const target = part.slice(0, i);
      const name = part.slice(i + 1);
      if (!(name in vals)) continue;
      const v = vals[name];
      if (target === 'text') {
        if (el.textContent !== String(v)) {
          el.textContent = String(v);
          // Résultat de simulateur : petit rebond pour signaler que le chiffre a changé.
          if (el.hasAttribute('data-count')) {
            el.classList.remove('vp-tick');
            void el.offsetWidth; // relance l'animation
            el.classList.add('vp-tick');
          }
        }
      } else if (target === 'if') el.hidden = !v;
      else if (target === 'value') {
        if ((el as HTMLInputElement).value !== String(v)) (el as HTMLInputElement).value = String(v);
      } else if (el.getAttribute(target) !== String(v)) el.setAttribute(target, String(v));
    }
  });
}

/** Branche les champs data-on-<évènement>="nom" sur un gestionnaire. */
export function onAll(scope: ParentNode, event: string, handlers: Record<string, (e: Event, el: HTMLElement) => void>) {
  scope.querySelectorAll<HTMLElement>(`[data-on-${event}]`).forEach((el) => {
    const h = handlers[el.getAttribute(`data-on-${event}`) || ''];
    if (h) el.addEventListener(event === 'change' ? 'input' : event, (e) => h(e, el));
  });
}
