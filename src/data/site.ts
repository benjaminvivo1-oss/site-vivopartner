/**
 * Données de référence du site : NAP, routes, métadonnées SEO et JSON-LD par page.
 * Titres, descriptions, canonical et og:image viennent de seo/pages.json (handoff v3) ;
 * le JSON-LD de chaque page vient de seo/jsonld/<page>.json, plus _site-global.json sur toutes les pages.
 * Le NAP doit rester identique partout (pied de page, Contact, JSON-LD, fiche Google, annuaires).
 */
import pages from './seo/pages.json';
import siteGlobal from './seo/jsonld/_site-global.json';
import accueil from './seo/jsonld/accueil.json';
import aplomb from './seo/jsonld/aplomb.json';
import receptionnisteIa from './seo/jsonld/receptionniste-ia.json';
import visibiliteLocale from './seo/jsonld/visibilite-locale.json';
import aPropos from './seo/jsonld/a-propos.json';
import contact from './seo/jsonld/contact.json';
import faq from './seo/jsonld/faq.json';
import mentionsLegales from './seo/jsonld/mentions-legales.json';
import confidentialite from './seo/jsonld/confidentialite.json';

export const SITE = {
  name: 'Vivo Partner',
  url: 'https://vivopartner.com',
  founder: 'Benjamin Vivo',
  email: 'benjamin@vivopartner.com',
  phone: {
    display: '06 40 20 22 46',
    href: 'tel:+33640202246',
  },
  city: 'Carcassonne',
} as const;

/** Clés de seo/pages.json. */
export type PageKey = keyof typeof pages;

export const SEO = pages;

export const JSONLD: Record<PageKey, object> = {
  accueil,
  aplomb,
  'receptionniste-ia': receptionnisteIa,
  'visibilite-locale': visibiliteLocale,
  'a-propos': aPropos,
  contact,
  faq,
  'mentions-legales': mentionsLegales,
  confidentialite,
};

export const JSONLD_GLOBAL = siteGlobal;

/** Chemin de la page (« /aplomb/ ») à partir de son URL canonique. */
export const pathOf = (key: PageKey) => new URL(SEO[key].url).pathname;
