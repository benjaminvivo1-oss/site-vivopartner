/**
 * Données de référence du site : NAP, routes et métadonnées SEO par page.
 * Le NAP doit rester identique partout (pied de page, Contact, JSON-LD, fiche Google, annuaires).
 */

export const SITE = {
  name: 'Vivo Partner',
  url: 'https://vivopartner.com',
  founder: 'Benjamin Vivo',
  founderRole: 'Fondateur',
  email: 'benjamin@vivopartner.com',
  phone: {
    display: '06 40 20 22 46',
    href: 'tel:+33640202246',
    e164: '+33640202246',
  },
  city: 'Carcassonne',
  locality: 'Carcassonne (Aude)',
  area: 'France et pays francophones',
  postalCode: '11000',
  region: 'Occitanie',
  department: 'Aude',
  siret: '101 538 791 00019',
  siretRaw: '10153879100019',
  /** Pays francophones servis (à valider par le client). */
  countries: ['Belgique', 'Suisse', 'Luxembourg', 'Canada'],
  /** Profils à ajouter dès qu'ils existent : Google Business Profile, LinkedIn, Facebook… */
  sameAs: [] as string[],
} as const;

export type PageKey = 'home' | 'aplomb' | 'ia' | 'visibilite' | 'apropos' | 'contact' | 'faq' | 'legal' | 'rgpd';

export const ROUTES: Record<PageKey, string> = {
  home: '/',
  aplomb: '/aplomb/',
  ia: '/receptionniste-ia/',
  visibilite: '/visibilite-locale/',
  apropos: '/a-propos/',
  contact: '/contact/',
  faq: '/faq/',
  legal: '/mentions-legales/',
  rgpd: '/confidentialite/',
};

/** Date de dernière mise à jour du contenu, affichée sur les pages de service et la FAQ. */
export const UPDATED: Partial<Record<PageKey, string>> = {
  aplomb: '2026-09-29',
  ia: '2026-09-29',
  visibilite: '2026-09-29',
  faq: '2026-09-29',
};

interface PageSeo {
  title: string;
  description: string;
  /** Libellé court (fil d'Ariane, liens). */
  label: string;
  ogTitle?: string;
  ogDescription?: string;
}

/** Textes repris de la maquette (<helmet> et setSeo()). */
export const SEO: Record<PageKey, PageSeo> = {
  home: {
    title: 'Vivo Partner — Partenaire digital du BTP · Carcassonne et toute la France',
    description:
      'Basé à Carcassonne, Vivo Partner accompagne les entreprises du BTP partout en France et dans les pays francophones : application sur mesure Aplomb, réceptionniste IA, site internet et référencement local. Audit gratuit de 30 min.',
    label: 'Accueil',
    ogTitle: 'Vivo Partner — Partenaire digital des entreprises du BTP',
    ogDescription:
      'Application sur mesure, réceptionniste IA et visibilité locale pour les entreprises du BTP. Audit gratuit.',
  },
  aplomb: {
    // Zone ajoutée au titre de la maquette (docs/SEO-LOCAL-IA-UX.md : métier + zone sur chaque page de service).
    title: 'Aplomb — Application sur mesure pour le BTP à Carcassonne | Vivo Partner',
    description:
      'Aplomb, l’application sur mesure pour gérer devis, factures, chantiers, équipes et relances de votre entreprise du BTP.',
    label: 'Aplomb',
  },
  ia: {
    // Zone ajoutée au titre de la maquette (docs/SEO-LOCAL-IA-UX.md : métier + zone sur chaque page de service).
    title: 'Réceptionniste IA pour artisans du BTP à Carcassonne | Vivo Partner',
    description:
      'Un réceptionniste IA qui répond aux appels, messages et mails de votre entreprise du BTP 24h/24, qualifie la demande et pose le rendez-vous. Sans changer de numéro.',
    label: 'Réceptionniste IA',
  },
  visibilite: {
    title: 'Site internet et référencement local BTP à Carcassonne | Vivo Partner',
    description:
      'Site internet, référencement local et IA (SEO/GEO), fiche Google et publicité pour les entreprises du BTP, partout en France.',
    label: 'Visibilité locale',
  },
  apropos: {
    title: 'À propos — Benjamin Vivo, Carcassonne | Vivo Partner',
    description:
      'Benjamin Vivo, fondateur de Vivo Partner à Carcassonne, accompagne le développement digital des entreprises du BTP.',
    label: 'À propos',
  },
  contact: {
    title: 'Audit digital gratuit pour le BTP — Contact Vivo Partner',
    description:
      'Réservez un audit gratuit de 30 minutes en visio avec Benjamin Vivo. Sans engagement, réponse sous 24h ouvrées.',
    label: 'Contact',
  },
  faq: {
    title: 'FAQ — Vivo Partner, digital pour le BTP',
    description:
      'Les réponses aux questions fréquentes sur Vivo Partner : Aplomb, réceptionniste IA, site et référencement local.',
    label: 'FAQ',
  },
  legal: {
    title: 'Mentions légales — Vivo Partner',
    description: 'Mentions légales du site Vivo Partner.',
    label: 'Mentions légales',
  },
  rgpd: {
    title: 'Politique de confidentialité — Vivo Partner',
    description: 'Politique de confidentialité et protection des données personnelles — Vivo Partner.',
    label: 'Confidentialité',
  },
};

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href;

/** « 29 septembre 2026 » à partir d'une date ISO. */
export const formatDateFr = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
