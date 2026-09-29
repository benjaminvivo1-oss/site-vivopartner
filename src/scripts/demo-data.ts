/** Textes des démos partagés entre le rendu serveur et le script client. */

/** Libellé de statut de la démo réceptionniste IA, par étape (index 1 à 6). */
export const IA_STATUS = [
  '',
  'Appel entrant — décroché en 1,2 s',
  'Transcription en temps réel',
  'Qualification de la demande',
  'Prise d’informations',
  'Créneau proposé et confirmé',
  'Fiche, agenda et notification envoyés',
];

export const IA_STEPS = [
  '01 · Appel',
  '02 · Écoute',
  '03 · Qualification',
  '04 · Infos',
  '05 · Créneau',
  '06 · Transmission',
];

export const APLOMB_SCREENS = 7;

/** Rythmes de lecture automatique (ms), identiques à la maquette. */
export const TIMING = {
  tab: 11000,
  iaStep: 1900,
  aplombScreen: 4200,
};
