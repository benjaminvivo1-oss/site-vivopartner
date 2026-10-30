/**
 * Formulaire dédié en bas de chaque page de service (src/components/ContactSection.astro) :
 * textes propres au service, service présélectionné et transmis dans l'e-mail.
 */
export const SERVICES = {
  aplomb: {
    label: 'Aplomb',
    eyebrow: 'Aplomb · démo gratuite',
    points: [
      'Vos devis, factures et relances au même endroit',
      'Ce qui peut se relier à vos outils actuels',
      'Sans engagement',
    ],
    placeholder: 'Ex. : je perds du temps sur mes devis et mes relances…',
  },
  'receptionniste-ia': {
    label: 'Réceptionniste IA',
    eyebrow: 'Réceptionniste IA · démo gratuite',
    points: [
      'Réglée pour votre métier et vos horaires',
      'On la teste ensemble, en direct',
      'Vous voyez le résumé arriver sur votre téléphone',
    ],
    placeholder: 'Ex. : je rate des appels quand je suis sur un chantier…',
  },
  'visibilite-locale': {
    label: 'Visibilité',
    eyebrow: 'Visibilité · point gratuit',
    points: [
      'Votre fiche Google et vos avis',
      'Votre site et votre référencement local',
      'Des pistes concrètes, sans engagement',
    ],
    placeholder: 'Ex. : on ne me trouve pas sur Google, je n’ai pas de site…',
  },
} as const;

export type ServiceKey = keyof typeof SERVICES;

/** Services à cocher dans le formulaire général de /contact/ (plusieurs choix possibles). */
export const SERVICE_OPTIONS = ['Aplomb', 'Réceptionniste IA', 'Visibilité'] as const;
