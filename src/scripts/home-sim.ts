/**
 * Simulateur de l'accueil : mêmes formules et mêmes libellés que la maquette (renderVals()).
 * Montants arrondis à l'euro, nombres entiers.
 */
import { bindAll, onAll } from './bind';

const section = document.getElementById('simulateur');
if (section) {
  const s = { simCalls: 20, simMiss: 35, simValue: 4000, simHours: 10, simQuotes: 6 };
  const eur = (n: number) => Math.round(n).toLocaleString('fr-FR') + ' €';

  const render = () => {
    const jobsMonth = s.simCalls * 4.33 * (s.simMiss / 100) * 0.6 * 0.7 * 0.3;
    const quotesMonth = s.simQuotes * 0.2;
    const monthly = (jobsMonth + quotesMonth) * s.simValue;
    const qy = Math.round(quotesMonth * 12);
    const cy = Math.round(jobsMonth * 12);
    const jyRaw = (jobsMonth + quotesMonth) * 12;
    const jy = cy + qy;
    const phRaw = s.simHours * 4.33;
    bindAll(section, {
      ...s,
      simQuotesLabel: s.simQuotes + ' devis',
      simQuotesYear: qy + (qy > 1 ? ' chantiers' : ' chantier'),
      simCallsLabel: s.simCalls + (s.simCalls > 1 ? ' appels' : ' appel'),
      simMissLabel: s.simMiss + ' %',
      simValueLabel: eur(s.simValue),
      simHoursLabel: s.simHours + ' h',
      simMonthly: eur(monthly),
      simYearly: eur(monthly * 12),
      simJobsYear: jyRaw > 0 && jy < 1 ? 'moins de 1 chantier' : jy + (jy > 1 ? ' chantiers' : ' chantier'),
      simCallsYear: cy + (cy > 1 ? ' chantiers' : ' chantier'),
      simPaperHours: Math.round(phRaw) + ' h',
      simPaperValue: eur(phRaw * 40),
    });
  };

  const set = (key: keyof typeof s) => (_e: Event, el: HTMLElement) => {
    s[key] = Number((el as HTMLInputElement).value);
    render();
  };
  onAll(section, 'change', {
    simOnCalls: set('simCalls'),
    simOnMiss: set('simMiss'),
    simOnValue: set('simValue'),
    simOnHours: set('simHours'),
    simOnQuotes: set('simQuotes'),
  });
  // Le navigateur peut restaurer la position des curseurs (retour arrière) : on repart de ces valeurs.
  section.querySelectorAll<HTMLInputElement>('input[type="range"][data-on-change]').forEach((input) => {
    const key = {
      simOnCalls: 'simCalls',
      simOnMiss: 'simMiss',
      simOnValue: 'simValue',
      simOnHours: 'simHours',
      simOnQuotes: 'simQuotes',
    }[input.dataset.onChange || ''] as keyof typeof s | undefined;
    if (key) s[key] = Number(input.value);
  });
  render();
}
