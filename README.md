# Site Vivo Partner

Site vitrine de **Vivo Partner**, partenaire digital des entreprises du BTP (Carcassonne, France entière, pays francophones). Objectif : faire réserver un **audit gratuit de 30 minutes**.

Site statique **Astro 7**, reproduction fidèle de la maquette haute fidélité **v3** (dossier de handoff `design_handoff_vivo_partner_v3` : `Site Vivo Partner v3.dc.html` et les 6 fichiers `Page*.dc.html`), avec les fichiers SEO du handoff (`seo/pages.json`, `seo/jsonld/`, `public/`). Consignes appliquées : [`docs/SEO-LOCAL-IA-UX.md`](docs/SEO-LOCAL-IA-UX.md) et [`docs/SEO-AUDIT-2026-10-28.md`](docs/SEO-AUDIT-2026-10-28.md).

## Démarrage

Prérequis : Node.js 22.12 ou plus récent.

```bash
npm install
npm run dev       # développement : http://localhost:4321
npm run build     # site statique dans dist/ (+ contrôle de la CSP)
npm run preview   # sert dist/ en local
npm run check     # vérification TypeScript et Astro
npm run format    # mise en forme (Prettier)
```

## Pages

Une URL et un HTML complet par page (la maquette était une application d'une seule page).

| URL                   | Page                      | Maquette                              | Contenu                                      |
| --------------------- | ------------------------- | ------------------------------------- | -------------------------------------------- |
| `/`                   | `src/pages/index.astro`   | `Site Vivo Partner v3.dc.html`        | `src/components/home/*.astro`                |
| `/visibilite-locale/` | `visibilite-locale.astro` | `PageVisibilite.dc.html`              | `src/components/pages/Visibilite.astro`      |
| `/receptionniste-ia/` | `receptionniste-ia.astro` | `PageReceptionniste.dc.html`          | `src/components/pages/Receptionniste.astro`  |
| `/aplomb/`            | `aplomb.astro`            | `PageAplomb.dc.html`                  | `src/components/pages/Aplomb.astro`          |
| `/faq/`               | `faq.astro`               | `PageFaq.dc.html`                     | `src/components/pages/Faq.astro`             |
| `/a-propos/`          | `a-propos.astro`          | `PageAPropos.dc.html`                 | `src/components/pages/APropos.astro`         |
| `/contact/`           | `contact.astro`           | `PageContact.dc.html`                 | `src/components/pages/Contact.astro`         |
| `/mentions-legales/`  | `mentions-legales.astro`  | dans `Site Vivo Partner v3.dc.html`   | `src/components/legal/MentionsLegales.astro` |
| `/confidentialite/`   | `confidentialite.astro`   | dans `Site Vivo Partner v3.dc.html`   | `src/components/legal/Confidentialite.astro` |
| page 404              | `404.astro`               | (non prévue, style des pages légales) | non indexée                                  |

`public/robots.txt`, `public/sitemap.xml` et `public/llms.txt` sont ceux du handoff, servis à la racine.

## Organisation

```
api/contact.js              fonction Vercel : envoi des demandes d'audit (Brevo)
docs/                       consignes du handoff v3 (SEO local et IA, audit SEO, checklist, charte)
public/assets/              images de la maquette (mascotte, photos, image de partage, logo navy du JSON-LD)
public/fonts/               polices auto-hébergées (Satoshi, Inter, JetBrains Mono)
src/
  assets/brand/             logos clairs de l'en-tête et du pied de page (optimisés au build)
  components/Header.astro   en-tête (ordinateur et mobile), menu Services
  components/Footer.astro   pied de page et barre « Appeler / Audit gratuit » (mobile)
  components/home/          sections de l'accueil
  components/pages/         contenu des pages secondaires
  components/legal/         mentions légales et confidentialité
  data/seo/                 pages.json et jsonld/ du handoff (copiés tels quels)
  data/site.ts              lecture de pages.json et des JSON-LD, NAP
  data/form.ts              adresse d'envoi des formulaires
  layouts/BaseLayout.astro  <head> (titre, description, canonical, og, JSON-LD), en-tête, pied de page
  scripts/                  comportements : menus, simulateurs, démo de la réceptionniste, formulaires
  styles/base.css           styles globaux de la maquette (keyframes, survols, requêtes de conteneur)
  styles/hover.css          survols et focus de la maquette (attributs style-hover / style-focus)
  styles/pages/*.css        styles propres à chaque page secondaire (balise <style> de sa maquette)
```

**Fidélité** : le balisage des sections a été converti automatiquement depuis les maquettes, styles en ligne compris (source de vérité des valeurs), avec les mêmes règles d'espacement que le moteur de la maquette. Seuls changent : les `role="button"` devenus de vrais `<a href>` (navigation) ou `<button>`, les états interactifs (`{{ … }}`) reliés au JavaScript par des attributs `data-bind` / `data-on-*`, et les chemins d'images. Le balisage converti est exclu de Prettier (`.prettierignore`) : le reformater pourrait changer les espaces affichés.

Tout le texte est dans le HTML généré, y compris les 6 réponses de la FAQ de l'accueil (`<details>`) et les 13 de `/faq/`. Le JavaScript ne sert qu'aux menus, aux simulateurs, au carrousel et à la démo d'appel de la réceptionniste, et aux formulaires.

## Modifier le contenu

- **Titres, descriptions, canonical, image de partage** : `src/data/seo/pages.json`.
- **JSON-LD** : `src/data/seo/jsonld/<page>.json` (une par page) et `_site-global.json` (sur toutes les pages). La FAQPage de `faq.json` doit rester identique aux questions et réponses visibles sur `/faq/`. Changer `dateModified` à chaque modification de contenu, et `lastmod` dans `public/sitemap.xml`.
- **Textes** : directement dans les composants (`src/components/home/`, `pages/`, `legal/`).
- **Simulateurs** : formules dans `src/scripts/home-sim.ts`, `aplomb.ts`, `receptionniste.ts` (les mêmes que la maquette), valeurs de départ dans le HTML.
- **Captures des maquettes de sites** (portfolio de `/visibilite-locale/` et éventail de la carte « Être trouvé » de l'accueil) : déposer `climatisation`, `renovation` et `electricite` (png, jpg, webp ou avif, format 4:3, haut de la page d'accueil du site) dans `src/assets/maquettes/`. Elles remplacent automatiquement les dessins provisoires, optimisées au build. En place : climatisation, électricité et rénovation, anonymisées (logos, noms d'entreprise, téléphones, e-mail et noms des auteurs d'avis floutés) : ce sont des projets ou des sites réalisés pour d'autres, pas des clients de Vivo Partner.
- **llms.txt** : `public/llms.txt`, à tenir à jour à chaque changement d'offre.
- **Profils (`sameAs`)** : à ajouter dans `_site-global.json` dès que la fiche Google, LinkedIn, etc. existent.

## Formulaire de contact

Mêmes champs partout (nom et téléphone obligatoires, entreprise, métier, besoin) : en bas de l'accueil (`src/components/home/Contact.astro`), sur `/contact/` et en bas de chaque page de service (`src/components/ContactSection.astro`). Logique commune dans `src/scripts/contact.ts` :

- libellés visibles, erreur sous chaque champ reliée par `aria-describedby`, confirmation « Merci {prénom}, c’est noté. » affichée à la place du formulaire, qui reçoit le focus (lue par les lecteurs d’écran) ;
- pas de case à cocher (la maquette v3 l'a remplacée par la mention « Vos informations ne servent qu'à vous recontacter… ») : une demande de rappel n'a pas besoin de consentement, la mention d'information suffit ;
- anti-spam invisible : champ piège, 30 s minimum entre deux envois dans le navigateur, 5 envois par IP et par tranche de 10 min côté serveur. Le champ piège est masqué (`hidden`) : placé hors de l'écran, il était rempli par la saisie automatique des navigateurs, et la demande d'un vrai visiteur était alors ignorée comme celle d'un robot ;
- envoi en JSON vers `/api/contact` ; sans JavaScript, envoi classique vers la même adresse, qui répond par une page simple ;
- en cas d'échec : message avec le numéro de téléphone et un lien « Envoyer ma demande par e-mail » pré-rempli ; si le serveur refuse un champ, l'erreur s'affiche sous ce champ.

Protections côté serveur (`api/contact.js`), pour que le formulaire ne serve ni à envoyer du spam ni un lien piégé depuis benjamin@vivopartner.com :

- envoi refusé (403) s'il vient d'un autre site (en-tête `Origin` d'un autre domaine) ; sans en-tête `Origin` (curl), il passe ;
- champs d'une ligne nettoyés (aucun retour à la ligne dans l'objet de l'e-mail), longueurs plafonnées, adresse e-mail vérifiée (une seule adresse, sans `< > , ; :`) ; corps de requête mal formé : erreur 400, pas de plantage ;
- accusé de réception : seul le prénom est repris, et seulement s'il ne contient que des lettres ; aucun accusé si le nom ou l'entreprise contient un lien ; au plus 2 accusés par adresse et par 24 h ;
- si seul l'accusé échoue, la demande compte comme envoyée (elle est déjà arrivée chez Vivo Partner) ; réponses en `Cache-Control: no-store`.

`api/contact.js` (fonction Vercel) valide les champs, puis envoie avec [Brevo](https://www.brevo.com/fr/), service français d'e-mails transactionnels (interface en français, données en Europe, gratuit jusqu'à 300 e-mails par jour) :

1. la demande à Vivo Partner, avec l'adresse du prospect en `Reply-To` ;
2. un accusé de réception au prospect, s'il a indiqué son e-mail (les formulaires v3 ne le demandent pas : l'accusé ne part que si un autre formulaire envoie un champ `email`).

| Variable d'environnement (Vercel) | Rôle                                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `BREVO_API_KEY`                   | clé API Brevo (obligatoire)                                                                              |
| `CONTACT_FROM`                    | expéditeur, sur le domaine authentifié dans Brevo (par défaut `Vivo Partner <benjamin@vivopartner.com>`) |
| `CONTACT_TO`                      | destinataire des demandes (par défaut `benjamin@vivopartner.com`)                                        |

Côté Brevo :

1. Authentifier le domaine `vivopartner.com` (Expéditeurs, domaines et IP dédiées > Domaines) et publier chez Squarespace les enregistrements DNS demandés. S'il faut toucher au SPF, fusionner avec celui de Google : il ne doit exister qu'un seul enregistrement SPF. **Fait** : domaine authentifié, avec le sous-domaine de marque `mail.vivopartner.com` (liens et images des e-mails). Enregistrements publiés : TXT `@` (`brevo-code:…`), CNAME `brevo1._domainkey` et `brevo2._domainkey` (DKIM), TXT `_dmarc` (`v=DMARC1; p=none`, rapports envoyés à Brevo), CNAME `mail`, `r.mail` et `img.mail`. Le SPF de Google n'a pas changé.
2. Créer une clé API (SMTP et API > Clés API) et la coller dans la variable `BREVO_API_KEY` de Vercel, en cochant **Production** et **Preview** (sans Preview, le formulaire échoue sur les prévisualisations), puis redéployer : une variable ne s'applique qu'aux déploiements suivants.
3. Désactiver le blocage des adresses IP inconnues (Sécurité > IP autorisées) : les fonctions Vercel n'ont pas d'adresse IP fixe.

Autres possibilités, réglées au build :

- `PUBLIC_CONTACT_ENDPOINT=https://…` : envoi vers un autre service qui accepte du JSON (Formspree, CRM, webhook…) ;
- `PUBLIC_CONTACT_ENDPOINT=` (vide) : pas d'envoi serveur, la messagerie du visiteur s'ouvre avec la demande pré-remplie.

Avec un autre service, ajouter son adresse à `connect-src` et `form-action` de la CSP (`vercel.json`), sinon le navigateur bloque l'envoi.

`npm run dev` ne lance pas la fonction : tester le formulaire sur un déploiement de prévisualisation Vercel ou avec `npx vercel dev`. Test rapide après déploiement :

```bash
curl -i -X POST https://vivopartner.com/api/contact \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"nom":"Test","tel":"06 00 00 00 00","metier":"Plombier"}'
```

## Mesure d'audience (facultatif)

Plausible (sans cookies) s'active avec des variables d'environnement lues au build :

- `PUBLIC_PLAUSIBLE_DOMAIN` : domaine déclaré dans Plausible, ex. `vivopartner.com` ;
- `PUBLIC_PLAUSIBLE_SRC` : adresse du script si ce n'est pas `https://plausible.io/js/script.js` (instance auto-hébergée, proxy).

Événements envoyés : `audit_cta_click` (boutons d'audit), `tel_click` (liens téléphone), `form_submit` (demande envoyée). Les déclarer comme objectifs d'événement dans Plausible. Le paragraphe « Cookies » de la page Confidentialité s'adapte automatiquement.

La CSP autorise déjà `https://plausible.io` et le petit script d'attente de Plausible. Avec une autre adresse (`PUBLIC_PLAUSIBLE_SRC`), l'ajouter à `script-src` et `connect-src` dans `vercel.json` : le build le signale.

## Déploiement (Vercel)

1. Importer le dépôt dans Vercel : le préréglage **Astro** est détecté (build `npm run build`, sortie `dist/`) et le dossier `api/` devient une fonction serverless.
2. Renseigner les variables d'environnement ci-dessus, puis redéployer.
3. Ajouter `vivopartner.com` et `www.vivopartner.com` dans Domains, avec redirection de `www` vers le domaine principal. HTTPS est automatique.
4. `vercel.json` gère les redirections de `seo/vercel.json.example` (`/visibilite` → `/visibilite-locale/`, `www` → domaine principal, `trailingSlash: true` : `/aplomb` → `/aplomb/`), les en-têtes de sécurité (voir Sécurité) et le cache long des polices et des fichiers `/_astro/`.

Les URL canoniques se terminent par `/` (`trailingSlash: 'always'`).

**Configuration en place** :

- **Branche** : `main` est la branche de production. Chaque envoi sur `main` met vivopartner.com à jour automatiquement (1 à 2 min). Les autres branches donnent des aperçus sur une adresse `.vercel.app`.
- **Domaine** : `vivopartner.com` est le domaine principal, `www.vivopartner.com` redirige vers lui (308).
- **Dépôt GitHub public**, volontairement : en formule gratuite (Hobby), Vercel bloque les déploiements d'un dépôt privé quand l'auteur du commit n'est pas le propriétaire du compte. Le dépôt ne contient aucun secret (la clé Brevo est dans les variables d'environnement de Vercel).
- **DNS** : ils se gèrent chez Squarespace Domains (ex-Google Domains), dans DNS > Paramètres DNS > Enregistrements personnalisés. Ne pas toucher aux enregistrements MX et SPF de Google : ce sont eux qui font fonctionner les adresses e-mail @vivopartner.com. Les enregistrements Brevo (voir Formulaire de contact) sont à garder tant que le formulaire passe par Brevo, et le TXT `google-site-verification` tant que Search Console est utilisé.

Sur un autre hébergeur statique, `dist/` fonctionne tel quel ; seule `api/contact.js` est propre à Vercel (utiliser alors `PUBLIC_CONTACT_ENDPOINT`).

## Sécurité

En-têtes envoyés avec chaque page (`vercel.json`) :

| En-tête                                              | Effet                                                                                                                                                                                                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`                            | seuls les scripts, styles, images et polices du site sont chargés (plus Plausible s'il est activé) ; le seul script écrit dans les pages est autorisé par son empreinte sha256 ; le site ne s'affiche dans aucun cadre ; les formulaires ne partent que vers le site |
| `require-trusted-types-for 'script'` (dans la CSP)   | les navigateurs compatibles refusent toute injection de HTML par un script (`innerHTML`…). Le site n'en fait aucune ; un ajout futur échouerait de façon visible au lieu d'ouvrir une faille                                                                         |
| `Strict-Transport-Security: max-age=63072000`        | HTTPS obligatoire pendant 2 ans. Sans `includeSubDomains`, pour ne pas gêner les sous-domaines de marque de Brevo (`mail`, `r.mail`, `img.mail`)                                                                                                                     |
| `X-Frame-Options: DENY`                              | même protection contre l'affichage dans un cadre, pour les anciens navigateurs                                                                                                                                                                                       |
| `Cross-Origin-Opener-Policy: same-origin`            | isole la page des fenêtres ouvertes depuis d'autres sites                                                                                                                                                                                                            |
| `Permissions-Policy`                                 | caméra, micro, géolocalisation, paiement, USB et Topics désactivés                                                                                                                                                                                                   |
| `X-Content-Type-Options: nosniff`, `Referrer-Policy` | pas d'interprétation hasardeuse des fichiers ; les autres sites ne reçoivent que le nom de domaine d'origine                                                                                                                                                         |

`npm run build` lance ensuite `scripts/check-csp.mjs` : si un script écrit dans une page change, ou si un script externe apparaît, sans que la CSP suive, le build échoue et Vercel garde la version en ligne. Le message donne l'empreinte ou l'adresse à ajouter dans `script-src`.

Audit du 1er octobre 2026 : `npm audit` sans vulnérabilité ; aucun secret dans tout l'historique git (le dépôt est public) ; fonction de contact testée sur 53 cas, dont des tentatives d'abus (autre site, JSON mal formé, retours à la ligne injectés, adresses multiples, liens dans le nom, envois répétés).

## Écarts avec la maquette

Le rendu reprend la maquette au pixel près (captures comparées à 1 440 px et 390 px sur les 9 pages avant les ajustements validés ci-dessous : mêmes hauteurs, différences limitées aux animations en boucle et au lissage des logos). Écarts :

- **Pages séparées** : une URL par page, avec ses balises et son JSON-LD, au lieu d'une seule page qui change de contenu.
- **FAQ de l'accueil** : en `<details>` pour que les 6 réponses soient dans le HTML (la maquette n'affichait que la réponse ouverte). Même rendu, une seule question ouverte à la fois.
- **Formulaires** : envoi réel (Brevo), message d'erreur sous chaque champ obligatoire (mêmes textes que la maquette), champ piège invisible contre les robots.
- **Mobile** : plus de défilement horizontal (la maquette débordait de quelques pixels sur l'accueil et la page Visibilité à 390 px).
- **Numéro de téléphone** : espaces insécables dans les liens `tel:`, le numéro ne se coupe plus sur deux lignes.
- **Accessibilité** (invisible) : vrais liens et boutons, menus annoncés (`aria-expanded`), menu fermé par Échap, lien d'évitement « Aller au contenu », bandeaux d'outils d'Aplomb atteignables au clavier quand les animations sont réduites.
- **Polices** : auto-hébergées, celles de la charte partout (titres Satoshi, texte Inter, étiquettes JetBrains Mono). Les maquettes des pages secondaires utilisaient Plus Jakarta Sans, hors charte (signalé par l'audit) : remplacée, validé le 28/10/2026.
- **Orange foncé** des petits textes sur fond clair : `#B45309` au lieu de `#B85A00` (contraste 5 : 1 au lieu de 4,3 : 1), validé le 28/10/2026.
- **Textes corrigés** (propositions de l'audit, validées le 28/10/2026) : H1 de l'accueil (« … venaient à vous, pendant que vos demandes et votre administratif se gèrent tout seuls ? »), « Des projets en cours », « Google Business Profile » au lieu de « Google My Business ».

Non repris volontairement : les variantes du hero que la maquette n'affiche pas (démo, photo, post-its), et les éléments d'édition de la maquette (`support.js`, `image-slot.js`).

## Ajouts à la maquette (validés le 28/10/2026)

- **Accueil, services** : chaque carte entière est cliquable vers sa page ; au survol de la carte « Être trouvé », les 3 sites s'ouvrent en éventail (ouvert d'office sur écran tactile).
- **Page Visibilité** : la photo du haut est remplacée par un visuel codé (recherche locale où l'entreprise sort en premier), comme les visuels d'Aplomb et de la réceptionniste (`src/components/pages/VisibiliteVisuel.astro`).
- **Démo de la réceptionniste** : simulation de la maquette (questions écrites à l'avance, réponses du visiteur reprises dans le résumé), suivie d'un appel à l'action « Tester ma réceptionniste » vers le formulaire en bas de la page (sous la démo et dans le résumé final).
- **« Voir l'appel »** : ouvre le récapitulatif complet (fiche, besoin entier, action à faire, conversation complète).
- **Confidentialité** : Brevo (envoi des e-mails) ajouté aux destinataires.
- **Formulaire dédié sur chaque page de service** : en bas d'Aplomb, de Réceptionniste IA et de Visibilité (à la place du bandeau d'appel à l'action de fin de page), le formulaire reprend des points propres au service ; le service est fixé (pas de liste à choisir) et repris dans l'objet de l'e-mail reçu ; l'événement `form_submit` porte le service. Sur ces pages, tous les boutons d'action (dont « Audit gratuit » de l'en-tête et de la barre mobile) descendent jusqu'à ce formulaire (`#contact`) ; sur les autres pages, ils mènent à `/contact/`, dont le formulaire, comme celui de l'accueil, propose les 3 services à cocher (plusieurs possibles, `src/components/ServiceChoices.astro`). Textes dans `src/data/services.ts`.
- **Éventail des sites** (carte « Être trouvé ») : les sites pivotent comme des cartes en main au survol ; sur écran tactile, l'éventail s'ouvre quand la carte arrive à l'écran.

## Animations

En plus de celles de la maquette (entrée du premier écran, démos en boucle, survols), une couche discrète (`src/scripts/motion.ts` et fin de `src/styles/base.css`) :

- **Apparition au défilement** : chaque bloc de section arrive en fondu avec une montée de 14 px, les cartes en cascade (90 ms d'écart). Le premier écran n'est jamais masqué (pas d'effet sur le chargement) ; seules l'opacité et la position changent (CLS 0).
- **Chiffres des simulateurs** : ils se construisent de 0 à leur valeur à leur apparition, et rebondissent légèrement quand on bouge un curseur.
- **Barre de lecture** orange sous l'en-tête, qui suit le défilement (navigateurs compatibles, sans JavaScript).
- **FAQ** : la réponse se déplie en douceur (navigateurs compatibles).
- **Changement de page** : fondu de 0,25 s, l'en-tête et la barre mobile restent en place (navigateurs compatibles).
- **Écrans tactiles** : les boutons s'enfoncent légèrement à l'appui.

Avec « réduire les animations » (réglage du système), tout s'affiche directement, sans mouvement. Sur les navigateurs qui ne gèrent pas un effet, la page s'affiche simplement sans lui.

## Vérifications

Faites le 28 octobre 2026 sur la version construite :

- **Fidélité** : comparaison pixel à pixel avec la maquette sur les 9 pages, à 1 440 et 390 px (voir ci-dessus).
- **SEO** : sur les 9 pages, titre, description, canonical et og:image identiques à `seo/pages.json` ; les 2 blocs JSON-LD identiques aux fichiers du handoff ; un seul `<h1>`, pas de saut de niveau ; aucun lien interne cassé ; FAQ de `/faq/` = FAQPage (13 questions).
- **Code** : HTML sans erreur (html-validate, règles recommandées), `astro check` 0 erreur, CSP conforme.
- **Fonctions** : 37 tests de bout en bout (menu Services et menu mobile, Échap, page en cours, défilement vers les leviers, FAQ, 3 simulateurs, carrousel et démo d'appel complète, formulaires : erreurs, envoi, confirmation, panne d'envoi, sans JavaScript) ; fonction de contact testée avec Brevo simulé.
- **Lighthouse mobile** (serveur local sans compression) : performance 94 à 97, bonnes pratiques 100, SEO 100. CLS 0, temps de blocage 0 ms.
- **Accessibilité** (axe-core) : seuls restent quelques mots en orange vif sur fond clair dans les grands titres, les petits textes verts de l'aperçu Aplomb et les points de 10 px du carrousel de la réceptionniste (dessin de la maquette).

## À faire

- [ ] **Pays servis** : le JSON-LD cite Belgique, Suisse, Luxembourg, Canada ; le pied de page dit « pays francophones » ; la FAQ dit « partout en France ». Choisir une version.
- [ ] **Blocs de réponse** sous le H1 des 3 pages de service et **liens entre pages de service** : proposés par l'audit, non ajoutés (nouveaux textes).
- [ ] **« Mis à jour le … »** visible sur les pages de service et la FAQ (consigne SEO IA) : absent de la maquette v3, non ajouté ; `dateModified` est dans le JSON-LD.
- [ ] **Fiche Google Business Profile** : validation par vidéo, puis Bing Places, Apple Business Connect, annuaires ; ajouter chaque profil dans `sameAs`.
- [ ] **Avis clients** : les afficher dès qu'il y en a 5 ou plus ; pas d'`aggregateRating` avant.
