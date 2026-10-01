# Site Vivo Partner

Site vitrine de **Vivo Partner**, partenaire digital des entreprises du BTP (Carcassonne, France entière, pays francophones). Objectif : faire réserver un **audit gratuit de 30 minutes**.

Site statique **Astro 7**, reproduit à partir de la maquette haute fidélité `Site Vivo Partner v2.dc.html` (dossier de handoff `design_handoff_site_vivo_partner`), en appliquant les consignes P1 de [`docs/SEO-LOCAL-IA-UX.md`](docs/SEO-LOCAL-IA-UX.md).

## Démarrage

Prérequis : Node.js 22.12 ou plus récent.

```bash
npm install
npm run dev       # développement : http://localhost:4321
npm run build     # site statique dans dist/
npm run preview   # sert dist/ en local
npm run check     # vérification TypeScript et Astro
npm run format    # mise en forme (Prettier)
```

## Pages

| URL                   | Fichier                                      |
| --------------------- | -------------------------------------------- |
| `/`                   | `src/pages/index.astro`                      |
| `/aplomb/`            | `src/pages/aplomb.astro`                     |
| `/receptionniste-ia/` | `src/pages/receptionniste-ia.astro`          |
| `/visibilite-locale/` | `src/pages/visibilite-locale.astro`          |
| `/a-propos/`          | `src/pages/a-propos.astro`                   |
| `/contact/`           | `src/pages/contact.astro`                    |
| `/faq/`               | `src/pages/faq.astro`                        |
| `/mentions-legales/`  | `src/pages/mentions-legales.astro`           |
| `/confidentialite/`   | `src/pages/confidentialite.astro`            |
| `/sitemap.xml`        | `src/pages/sitemap.xml.ts` (généré au build) |
| page 404              | `src/pages/404.astro` (non indexée)          |

`/robots.txt` et `/llms.txt` sont dans `public/` (fournis avec la maquette).

## Organisation

```
api/contact.js              fonction Vercel : envoi des demandes d'audit (Brevo)
docs/                       consignes du handoff (SEO local et IA, charte, checklist)
public/                     polices, logos des intégrations, icônes, images de partage (og/), robots.txt, llms.txt
scripts/og-images.mjs       régénère les images de partage public/og/*.png
src/
  assets/brand/             logos (optimisés au build)
  assets/hero/              photo de fond du hero (facultative, voir plus bas)
  components/               en-tête, pied de page, CTA, formulaire, sections de l'accueil, démos
  data/site.ts              NAP, URL, titres et descriptions SEO, dates de mise à jour
  data/faq.ts               les 9 questions et réponses (page FAQ + JSON-LD)
  data/schema.ts            JSON-LD : ProfessionalService, WebSite, WebPage/FAQPage, Service, BreadcrumbList, Person
  layouts/BaseLayout.astro  <head> (SEO, Open Graph, JSON-LD, polices), en-tête, <main>, pied de page
  pages/                    une page par URL
  scripts/                  comportements : menu, apparitions, démos, formulaire, mesure d'audience
  styles/global.css         polices auto-hébergées, animations, états :hover, focus
```

Les valeurs de style viennent de la maquette, dont les styles en ligne sont la source de vérité : ils sont conservés tels quels dans les composants. Les états `:hover`, les animations et le passage en mobile (requêtes de conteneur sous 900 px, comme la maquette) sont dans `src/styles/global.css` et dans les composants. Les attributs `data-screen-label` de la maquette sont conservés pour retrouver chaque section.

Tout le texte est dans le HTML généré : le JavaScript ne sert qu'aux démos, au menu mobile, aux apparitions au défilement et au formulaire.

## Modifier le contenu

- **Coordonnées (NAP), titres et descriptions des pages** : `src/data/site.ts`. Le NAP doit rester identique partout (site, JSON-LD, fiche Google, annuaires).
- **Date « Mis à jour le »** (pages de service et FAQ) : `UPDATED` dans `src/data/site.ts`. Elle alimente aussi `dateModified` (JSON-LD) et `lastmod` (sitemap). À changer à chaque modification de contenu.
- **FAQ** : `src/data/faq.ts`, source unique du texte affiché et du JSON-LD `FAQPage`.
- **Données structurées** : `src/data/schema.ts` ; profils (`sameAs`) et pays servis dans `src/data/site.ts`.
- **Démos** (textes et rythmes) : `src/scripts/demo-data.ts` et `src/components/demos/`.
- **llms.txt** : `public/llms.txt`, à tenir à jour à chaque changement d'offre.

### Photo du hero

Déposer une photo (jpg, png, webp ou avif ; droits libres, sans visage, idéalement 2560 px de large) dans `src/assets/hero/`. Elle est utilisée automatiquement, convertie en AVIF et WebP en plusieurs tailles et chargée en priorité, sous le voile navy de la maquette. Sans photo, le fond reste navy.

### Images de partage (Open Graph)

Une image 1200 × 630 par page dans `public/og/`. À régénérer si un titre change :

```bash
npm install --no-save playwright && npx playwright install chromium
node scripts/og-images.mjs
```

## Formulaire de contact

Le formulaire (`src/components/ContactForm.astro`, logique dans `src/scripts/contact.ts`) :

- libellés visibles, erreur sous chaque champ reliée par `aria-describedby`, confirmation annoncée (`role="status"`) ;
- case de consentement RGPD avec lien vers `/confidentialite/` ;
- anti-spam invisible : champ piège, 30 s minimum entre deux envois dans le navigateur, 5 envois par IP et par tranche de 10 min côté serveur ;
- envoi en JSON vers `/api/contact` ; sans JavaScript, envoi classique vers la même adresse, qui répond par une page simple ;
- en cas d'échec : message avec le numéro de téléphone et un lien « Envoyer ma demande par e-mail » pré-rempli.

`api/contact.js` (fonction Vercel) valide les champs, puis envoie avec [Brevo](https://www.brevo.com/fr/), service français d'e-mails transactionnels (interface en français, données en Europe, gratuit jusqu'à 300 e-mails par jour) :

1. la demande à Vivo Partner, avec l'adresse du prospect en `Reply-To` ;
2. un accusé de réception au prospect, s'il a indiqué son e-mail.

| Variable d'environnement (Vercel) | Rôle                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `BREVO_API_KEY`                   | clé API Brevo (obligatoire)                                                                              |
| `CONTACT_FROM`                    | expéditeur, sur le domaine authentifié dans Brevo (par défaut `Vivo Partner <benjamin@vivopartner.com>`) |
| `CONTACT_TO`                      | destinataire des demandes (par défaut `benjamin@vivopartner.com`)                                        |

Côté Brevo :

1. Authentifier le domaine `vivopartner.com` (Expéditeurs, domaines et IP dédiées > Domaines) et publier chez Squarespace les enregistrements DNS demandés. S'il faut toucher au SPF, fusionner avec celui de Google : il ne doit exister qu'un seul enregistrement SPF. **Fait** : domaine authentifié, avec le sous-domaine de marque `mail.vivopartner.com` (liens et images des e-mails). Enregistrements publiés : TXT `@` (`brevo-code:…`), CNAME `brevo1._domainkey` et `brevo2._domainkey` (DKIM), TXT `_dmarc` (`v=DMARC1; p=none`, rapports envoyés à Brevo), CNAME `mail`, `r.mail` et `img.mail`. Le SPF de Google n'a pas changé.
2. Créer une clé API (SMTP et API > Clés API) et la coller dans la variable `BREVO_API_KEY` de Vercel, puis redéployer.
3. Désactiver le blocage des adresses IP inconnues (Sécurité > IP autorisées) : les fonctions Vercel n'ont pas d'adresse IP fixe.

Autres possibilités, réglées au build :

- `PUBLIC_CONTACT_ENDPOINT=https://…` : envoi vers un autre service qui accepte du JSON (Formspree, CRM, webhook…) ;
- `PUBLIC_CONTACT_ENDPOINT=` (vide) : pas d'envoi serveur, la messagerie du visiteur s'ouvre avec la demande pré-remplie.

`npm run dev` ne lance pas la fonction : tester le formulaire sur un déploiement de prévisualisation Vercel ou avec `npx vercel dev`. Test rapide après déploiement :

```bash
curl -i -X POST https://vivopartner.com/api/contact \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"nom":"Test","tel":"06 00 00 00 00","email":"vous@exemple.fr","consentement":"oui"}'
```

## Mesure d'audience (facultatif)

Plausible (sans cookies) s'active avec des variables d'environnement lues au build :

- `PUBLIC_PLAUSIBLE_DOMAIN` : domaine déclaré dans Plausible, ex. `vivopartner.com` ;
- `PUBLIC_PLAUSIBLE_SRC` : adresse du script si ce n'est pas `https://plausible.io/js/script.js` (instance auto-hébergée, proxy).

Événements envoyés : `audit_cta_click` (boutons d'audit), `tel_click` (liens téléphone), `form_submit` (demande envoyée). Les déclarer comme objectifs d'événement dans Plausible. Le paragraphe « Cookies » de la page Confidentialité s'adapte automatiquement.

## Déploiement (Vercel)

1. Importer le dépôt dans Vercel : le préréglage **Astro** est détecté (build `npm run build`, sortie `dist/`) et le dossier `api/` devient une fonction serverless.
2. Renseigner les variables d'environnement ci-dessus, puis redéployer.
3. Ajouter `vivopartner.com` et `www.vivopartner.com` dans Domains, avec redirection de `www` vers le domaine principal. HTTPS est automatique.
4. `vercel.json` gère la redirection `/visibilite` → `/visibilite-locale/`, les en-têtes de sécurité et le cache long des polices et des fichiers `/_astro/`.

Les URL canoniques se terminent par `/` (`trailingSlash: 'always'`).

**Configuration en place** :

- **Branche** : `main` est la branche de production. Chaque envoi sur `main` met vivopartner.com à jour automatiquement (1 à 2 min). Les autres branches donnent des aperçus sur une adresse `.vercel.app`.
- **Domaine** : `vivopartner.com` est le domaine principal, `www.vivopartner.com` redirige vers lui (308).
- **DNS** : ils se gèrent chez Squarespace Domains (ex-Google Domains), dans DNS > Paramètres DNS > Enregistrements personnalisés. Ne pas toucher aux enregistrements MX et SPF de Google : ce sont eux qui font fonctionner les adresses e-mail @vivopartner.com. Les enregistrements Brevo (voir Formulaire de contact) sont à garder tant que le formulaire passe par Brevo, et le TXT `google-site-verification` tant que Search Console est utilisé.

Sur un autre hébergeur statique, `dist/` fonctionne tel quel ; seule `api/contact.js` est propre à Vercel (utiliser alors `PUBLIC_CONTACT_ENDPOINT`).

## Écarts volontaires avec la maquette

Le rendu reprend la maquette à l'identique (comparaison des captures à 1440 px et 390 px, textes comparés mot à mot), sauf :

- **Accueil** : sous-titre visible « Carcassonne, Aude et partout en France » sous le H1, avec un repère orange (consignes SEO local, validé). Le H1 ne change pas.
- **Pages de service** : bloc de réponse de 40 à 60 mots sous le H1 et mention « Mis à jour le … » (consignes SEO IA) ; « Mis à jour le … » aussi sur la FAQ.
- **Titres `<title>`** d'Aplomb et de la réceptionniste IA : ajout du métier et de la zone (« … pour le BTP à Carcassonne »).
- **Mobile** : bouton « Appeler » (`tel:`) dans la barre collante, à côté de « Audit gratuit ».
- **Démos** : bouton pause visible ; la lecture automatique s'arrête au survol, au focus et au premier clic, et ne démarre pas si le visiteur a demandé à réduire les animations.
- **Formulaire** : case de consentement, message d'erreur sous chaque champ, champ piège invisible.
- **Qonto** (bandeau des intégrations) : pastille « Q » à la place du favicon que la maquette chargeait depuis un service Google. Déposer le logo officiel dans `public/integrations/` si besoin.
- **Orange sur fond clair** : les petits textes orange posés sur fond blanc (numéros des cartes, astérisques et liens du formulaire, contours outline) passent en orange foncé `#B45309` (jeton `--vp-orange-ink`, contraste 5 : 1). Même chose pour la case à cocher et le contour de focus clavier sur les surfaces claires (`.vp-light`). Sur fond marine, l'orange de la charte `#F58220` ne change pas.
- Invisibles : vrais liens `<a href>` et boutons `<button>` à la place des `role="button"`, lien d'évitement « Aller au contenu », polices auto-hébergées, page 404.

La FAQ s'ouvre sur la première question, comme la maquette (son état `faqOpen: 1` compte à partir de 1, alors que le README du handoff parle de la 2e).

## Animations

Une couche de mouvement s'ajoute aux animations de la maquette. Au repos, chaque page est identique au pixel près à la version sans ces ajouts. Principes :

- **Un seul vocabulaire** : montée de 12 à 14 px avec la courbe de la maquette (`--vp-ease`), jamais de rebond, une seule fois par élément. Durées dans `src/styles/global.css` (`--vp-t-fast`, `--vp-t-state`, `--vp-t-enter`).
- **Un geste par écran** : l'en-tête d'une section, puis son contenu, avec un léger décalage entre éléments voisins.
- **Sens** : chaque animation raconte quelque chose (une étape qui suit l'autre, une case cochée, un chiffre qui se construit).
- **Accessibilité** : avec « réduire les animations », tout s'affiche directement ; la lecture automatique des démos est désactivée.

Ce qui bouge :

- **Ouverture de chaque page** : les éléments du premier écran arrivent l'un après l'autre (classe `vp-intro`).
- **Accueil** : la carte « Diagnostic digital » se pose et se cale, son ruban se déroule, les 3 priorités s'écrivent, puis la pastille « 30 min » est tamponnée.
- **Au défilement** (`data-vp-reveal`) : les sections apparaissent. Les cartes « papier » (`vp-paper`) se posent un peu plus inclinées puis se calent. Les critères « C'est pour vous si… » se cochent un à un. Le filet de la méthode se trace sous les 4 étapes. Les étapes du flux IA s'enchaînent.
- **Chiffres clés** (≈5 h, +30 %, +50 %) : décompte à l'apparition (`data-vp-count`) ; la valeur finale reste écrite dans le HTML.
- **Démos** : elles démarrent quand elles sont à l'écran. Sur l'accueil, l'onglet actif se remplit d'un filet orange pendant la lecture automatique ; le filet se fige au survol ou au focus.
- **Interactions** :
  - flèches « → » qui avancent au survol ;
  - filet sous les liens du menu ;
  - burger qui devient une croix ;
  - boutons qui s'enfoncent à la pression ;
  - réponses de la FAQ qui se déplient en douceur, avec l'icône + qui devient − ;
  - messages d'erreur du formulaire qui apparaissent en fondu.
- **Navigation** : fondu entre les pages, avec l'en-tête et la barre mobile qui restent en place (navigateurs compatibles). Filet de lecture orange sous l'en-tête, qui suit le défilement.

## Vérifications

Réalisées le 30 septembre 2026 :

- **Lighthouse mobile** (performance / accessibilité / bonnes pratiques / SEO) : 98–99 / 100 / 100 / 100 sur toutes les pages. LCP 1,8 à 2,3 s, CLS 0.
- **axe-core** (via Lighthouse) : aucune erreur.
- **`astro check`** : 0 erreur.
- Démos, menus, FAQ et formulaire testés au clavier et à la souris ; `api/contact.js` testée (validation, champ piège, limite de débit, échec d'envoi).
- **Animations** : rendu au repos identique à la version sans animations (captures comparées sur les 9 pages, à 1440 et 390 px) ; CLS 0 à 0,0003 ; Lighthouse mobile de l'accueil inchangé (98, blocage 0 à 10 ms).

## À faire avant la mise en ligne

- [x] **Domaine** : `vivopartner.com` est branché sur Vercel. Reste à mettre à jour les valeurs DNS recommandées par Vercel (voir Domains dans Vercel).
- [x] **Formulaire** : Brevo configuré (domaine authentifié, clé `BREVO_API_KEY` dans Vercel), testé de bout en bout sur vivopartner.com : demande reçue sur benjamin@vivopartner.com et accusé de réception envoyé au prospect.
- [x] **Mentions légales** : hébergeur complété (Vercel Inc., adresse et téléphone, obligatoires au titre de la LCEN). L'adresse est celle de la politique de confidentialité de Vercel ; le téléphone est celui publié habituellement pour Vercel, à recouper si Vercel en publie un autre. Brevo est déjà cité parmi les prestataires de la page Confidentialité.
- [x] **Pays servis** dans le JSON-LD : Belgique, Suisse, Luxembourg, Canada, validés (`SITE.countries`).
- [x] **Textes ajoutés** (blocs de réponse des pages de service, titres d'Aplomb et de la réceptionniste IA) : validés.
- [x] **Photo du hero** : pas pour le lancement, l'accueil garde son fond marine. Pour en ajouter une plus tard : déposer le fichier dans `src/assets/hero/`.
- [x] **Contraste** : orange foncé `#B45309` pour les petits éléments sur fond clair (accessibilité 100).
- [x] **Google Search Console** et **Bing Webmaster Tools** : domaine vérifié dans Search Console (propriété « Domaine », enregistrement TXT `google-site-verification` chez Squarespace), sitemap `https://vivopartner.com/sitemap.xml` envoyé ; site importé dans Bing depuis Search Console.
- [x] **Données structurées** : JSON-LD valide sur les 9 pages (contrôle sur `dist/`). Seul le fil d'Ariane peut donner un résultat enrichi : Google réserve les FAQ enrichies aux sites officiels (santé, administration). Contrôle officiel facultatif avec le [test des résultats enrichis](https://search.google.com/test/rich-results).
- [ ] **Fiche Google Business Profile** : créée (prestataire de services, adresse masquée, catégorie « Consultant en marketing », zones Carcassonne et Aude, services et description repris du site). Reste la validation par vidéo, puis Bing Places (import depuis Google), Apple Business Connect, annuaires ; ajouter le lien de chaque profil dans `SITE.sameAs`.
- [ ] **Avis clients** : les afficher dès qu'il y en a 5 ou plus ; pas d'`aggregateRating` avant.
- [x] **Sous-titre de l'accueil** « Carcassonne, Aude et partout en France » sous le H1 : validé et ajouté (Lighthouse mobile inchangé : 98 / 100 / 100 / 100, CLS 0).
