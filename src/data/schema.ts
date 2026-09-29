/**
 * Données structurées schema.org (JSON-LD).
 * Base : le bloc @graph de la maquette, corrigé selon docs/SEO-LOCAL-IA-UX.md
 * (adresse sans rue, Occitanie dans areaServed, Service par page, FAQPage sur /faq/ uniquement,
 * BreadcrumbList sur les pages internes, pas d'aggregateRating sans avis affichés).
 */
import { SITE, ROUTES, SEO, UPDATED, absoluteUrl, type PageKey } from './site';
import { FAQ } from './faq';

type Json = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#org`;
const SITE_ID = `${SITE.url}/#site`;

export const organization = (): Json => ({
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: absoluteUrl('/brand/vp-logo-512.png'),
  image: absoluteUrl('/og/home.png'),
  description:
    'Partenaire digital des entreprises du BTP : application sur mesure Aplomb, réceptionniste IA, site internet, référencement local et publicité. Basé à Carcassonne, intervient à distance en France et dans les pays francophones.',
  founder: { '@type': 'Person', name: SITE.founder, jobTitle: SITE.founderRole },
  email: SITE.email,
  telephone: SITE.phone.e164,
  taxID: SITE.siretRaw,
  address: {
    '@type': 'PostalAddress',
    addressLocality: SITE.city,
    postalCode: SITE.postalCode,
    addressRegion: SITE.region,
    addressCountry: 'FR',
  },
  areaServed: [
    { '@type': 'City', name: SITE.city },
    { '@type': 'AdministrativeArea', name: SITE.department },
    { '@type': 'AdministrativeArea', name: SITE.region },
    { '@type': 'Country', name: 'France' },
    ...SITE.countries.map((name) => ({ '@type': 'Country', name })),
  ],
  availableLanguage: 'fr',
  knowsAbout: [
    'BTP',
    'Logiciel sur mesure',
    'Réceptionniste IA',
    'Référencement local',
    'Création de site internet',
    'Google Business Profile',
  ],
  ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Leviers Vivo Partner',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Audit digital gratuit',
          description: 'Audit de 30 minutes en visio, sans engagement.',
        },
        price: '0',
        priceCurrency: 'EUR',
      },
      ...(['aplomb', 'ia', 'visibilite'] as const).map((key) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${absoluteUrl(ROUTES[key])}#service`,
          name: SERVICES[key]!.name,
          description: SERVICES[key]!.description,
          url: absoluteUrl(ROUTES[key]),
        },
      })),
    ],
  },
});

export const website = (): Json => ({
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: `${SITE.url}/`,
  name: SITE.name,
  inLanguage: 'fr-FR',
  publisher: { '@id': ORG_ID },
});

const PAGE_TYPES: Partial<Record<PageKey, string>> = {
  faq: 'FAQPage',
  contact: 'ContactPage',
  apropos: 'AboutPage',
};

export const webPage = (page: PageKey): Json => {
  const url = absoluteUrl(ROUTES[page]);
  const updated = UPDATED[page];
  return {
    '@type': PAGE_TYPES[page] ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: SEO[page].title,
    description: SEO[page].description,
    inLanguage: 'fr-FR',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    ...(page !== 'home' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    ...(updated ? { dateModified: updated } : {}),
    ...(page === 'faq'
      ? {
          mainEntity: FAQ.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: { '@type': 'Answer', text: answer },
          })),
        }
      : {}),
  };
};

export const breadcrumb = (page: PageKey): Json => {
  const url = absoluteUrl(ROUTES[page]);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SEO.home.label, item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: SEO[page].label, item: url },
    ],
  };
};

const SERVICES: Partial<Record<PageKey, { name: string; serviceType: string; description: string }>> = {
  aplomb: {
    name: 'Aplomb',
    serviceType: 'Application de gestion sur mesure pour entreprise du BTP',
    description:
      'Application sur mesure pour les entreprises du BTP : devis, factures, relances, chantiers, planning, CRM et comptabilité, adaptée à la façon de travailler de l’entreprise.',
  },
  ia: {
    name: 'Réceptionniste IA',
    serviceType: 'Réceptionniste IA pour artisans et entreprises du BTP',
    description:
      'Répond aux appels, messages et e-mails 24h/24, qualifie la demande, pose le rendez-vous et la transmet, sans changer de numéro.',
  },
  visibilite: {
    name: 'Visibilité locale',
    serviceType: 'Création de site internet et référencement local pour le BTP',
    description:
      'Site internet, référencement local et dans les IA (SEO/GEO), optimisation de la fiche Google Business Profile et publicités Meta/Google pour générer des demandes de devis.',
  },
};

export const service = (page: PageKey): Json | null => {
  const s = SERVICES[page];
  if (!s) return null;
  const url = absoluteUrl(ROUTES[page]);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    url,
    provider: { '@id': ORG_ID },
    areaServed: [
      { '@type': 'City', name: SITE.city },
      { '@type': 'AdministrativeArea', name: SITE.region },
      { '@type': 'Country', name: 'France' },
    ],
    audience: { '@type': 'BusinessAudience', audienceType: 'Entreprises et artisans du BTP' },
  };
};

/** Graphe complet pour une page. */
export const graphFor = (page: PageKey): Json => {
  const nodes: Json[] = [organization(), website(), webPage(page)];
  if (page !== 'home') nodes.push(breadcrumb(page));
  const svc = service(page);
  if (svc) nodes.push(svc);
  return { '@context': 'https://schema.org', '@graph': nodes };
};
