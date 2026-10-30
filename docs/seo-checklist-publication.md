# SEO et référencement local — checklist de publication (mise à jour 28/10/2026)

Remplace la version précédente (URLs sans slash final, `/visibilite`, conseil de publier une adresse postale : tout cela est périmé). Détails et justifications : `SEO-AUDIT-2026-10-28.md` et `SEO-LOCAL-IA-UX.md`.

## Déjà intégré dans la maquette
- [x] Titre (≤ 60 car.), description (≤ 160 car.), canonical, og et twitter propres à chaque page — `seo/pages.json`
- [x] JSON-LD par page : Organisation, Person, WebSite (global) + WebPage, BreadcrumbList, Service, AboutPage, ContactPage, FAQPage — `seo/jsonld/`
- [x] FAQPage = exactement les 13 questions et réponses visibles sur `/faq/`
- [x] NAP identique et cliquable (`tel:`, `mailto:`) dans le pied de page ; bouton « Appeler » mobile
- [x] Liens de navigation en `<a href>` vers les URL finales
- [x] Images : WebP, dimensions, lazy-loading ; og-image 1200 × 630 ; favicon et apple-touch-icon
- [x] `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`

## À faire par le développeur à l'intégration
- [ ] **Une URL et un HTML complet par page** (Astro / Next SSG), `trailingSlash: true`
- [ ] URL finales : `/`, `/aplomb/`, `/receptionniste-ia/`, `/visibilite-locale/`, `/a-propos/`, `/faq/`, `/contact/`, `/mentions-legales/`, `/confidentialite/`
- [ ] Coller `seo/jsonld/<page>.json` + `_site-global.json` dans chaque page ; valider avec le Test des résultats enrichis
- [ ] Toutes les réponses de la FAQ de l'accueil dans le HTML (`<details>`)
- [ ] Un seul `<h1>` par page, pas de saut de niveau (h2 avant les h3 de l'accueil)
- [ ] Redirections (`seo/vercel.json.example`) : www → domaine principal, http → https, anciennes URL → nouvelles
- [ ] Polices auto-hébergées, `font-display: swap`
- [ ] Lighthouse mobile ≥ 90 (performance, accessibilité, SEO)

## À faire par vous
- [ ] Corriger les fautes du H1 de l'accueil et « Des projet en cours » (voir l'audit)
- [ ] Confirmer le domaine `vivopartner.com` et la liste des pays servis
- [ ] **Google Business Profile** en zone de service (adresse masquée), puis **Bing Places** et **Apple Business Connect**
- [ ] Search Console et Bing Webmaster Tools : vérifier le domaine, envoyer le sitemap
- [ ] Même NAP partout : « Vivo Partner · Carcassonne (Aude) · 06 40 20 22 46 · benjamin@vivopartner.com »
- [ ] Annuaires : PagesJaunes, CCI de l'Aude, LinkedIn Entreprise
- [ ] Premiers avis Google réels (sans filtrage), réponse à chacun ; `aggregateRating` seulement à partir de 5 avis affichés
- [ ] Remplir `sameAs` dans `_site-global.json` quand les profils existent
