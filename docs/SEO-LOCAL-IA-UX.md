# Consignes de développement : SEO local, SEO IA, UX

Document destiné à Claude Code. À appliquer en plus du `README.md`. Priorités : **P1** obligatoire au lancement, **P2** dans le mois, **P3** ensuite.

## Profil
- **Type** : entreprise à zone de service (pas d'adresse d'accueil public). Ne pas publier d'adresse postale ni de carte avec repère.
- **Secteur** : services B2B aux entreprises du BTP (conseil digital, logiciel sur mesure, IA, référencement).
- **NAP de référence** (identique partout : pied de page, Contact, JSON-LD, Google Business Profile, annuaires) :
  - Nom : `Vivo Partner`
  - Ville : `Carcassonne (Aude), France`
  - Téléphone : `06 40 20 22 46` → lien `tel:+33640202246`
  - E-mail : `benjamin@vivopartner.com`

## 1. Technique (P1)
- **Génération statique** (Astro ou Next.js SSG). Tout le texte doit être dans le HTML servi, sans dépendre du JavaScript. Les démos interactives peuvent être des îlots JS, mais leur texte principal reste dans le HTML.
- **Une URL par page** (voir README), avec `<title>`, meta description, canonical, og:url et og:image propres à chaque page. Reprendre les textes du `<helmet>` de la maquette.
- `sitemap.xml` généré au build + `robots.txt` et `llms.txt` (fichiers fournis dans `public/`).
- **HTML sémantique** : `<header>`, `<nav>`, `<main>`, `<footer>`, un seul `<h1>` par page, puis h2/h3 dans l'ordre. Remplacer tous les `role="button"` de navigation par de vrais `<a href>`, et les actions par des `<button>`.
- **Images** : WebP/AVIF, `width`/`height` renseignés, `loading="lazy"` sauf l'image de fond du hero (`fetchpriority="high"`). Attribut `alt` descriptif sur toute image qui porte du sens.
- **Polices** : auto-héberger Satoshi, Inter et JetBrains Mono (`font-display: swap`, préchargement des 2 graisses principales). Retirer Playfair Display si elle n'est pas utilisée.
- **Objectifs Core Web Vitals** : LCP < 2,5 s, CLS < 0,1, INP < 200 ms. Réserver l'espace de toutes les images et démos.
- `<html lang="fr">`, `og:locale` `fr_FR`, favicon et apple-touch-icon à partir de `assets/vp-mark-navy.png`.

## 2. SEO local (P1)
- **NAP visible dans le pied de page de toutes les pages** : « Vivo Partner · Carcassonne (Aude) · France et pays francophones · 06 40 20 22 46 · benjamin@vivopartner.com ». Téléphone en lien `tel:`, e-mail en `mailto:`.
- **Mobile** : bouton d'appel (`tel:`) accessible dans le header ou en barre collante, en plus du CTA « Réserver un audit ».
- **Titres et H1** : chaque page de service mentionne le métier ciblé et la zone. Proposition pour le H1 de l'accueil (à valider par le client, le texte actuel reste la référence) : ajouter un sous-titre visible « Carcassonne, Aude et partout en France ».
- **Pages de service dédiées** (déjà prévues) : `/aplomb/`, `/receptionniste-ia/`, `/visibilite-locale/`. Chacune avec son propre JSON-LD `Service`.
- **Pas de pages ville en série** (« SEO Narbonne », « SEO Perpignan »…) tant qu'il n'y a pas de contenu réellement propre à chaque ville (clients, projets, photos). Sinon risque de pages satellites.

### JSON-LD (P1)
Reprendre le bloc `@graph` de la maquette, avec ces corrections :
- Type `ProfessionalService` conservé. `@id` : `https://vivopartner.com/#org`.
- `address` : seulement `addressLocality: "Carcassonne"`, `addressRegion: "Occitanie"`, `postalCode: "11000"`, `addressCountry: "FR"`. Pas de `streetAddress`.
- `telephone: "+33640202246"`, `email`, `founder` (`Person` Benjamin Vivo), `logo`, `image`.
- `areaServed` : Carcassonne, Aude, Occitanie, France, puis les pays francophones validés.
- `sameAs` : à remplir dès que les profils existent (Google Business Profile, LinkedIn, Facebook…).
- Sur chaque page de service : `Service` avec `provider: {"@id": "https://vivopartner.com/#org"}` et `serviceType`.
- `/faq/` : `FAQPage` avec exactement les questions et réponses visibles sur la page.
- `BreadcrumbList` sur toutes les pages internes.
- **Ne pas ajouter `aggregateRating`** tant qu'il n'y a pas de vrais avis affichés sur la page.
- Valider chaque page avec le Test des résultats enrichis de Google.

### Hors site (à faire par le client, P1-P2)
1. Créer la fiche **Google Business Profile** en zone de service (adresse masquée), catégorie principale la plus proche du métier réel (par ex. « Consultant en marketing » ou « Concepteur de sites Web »). Lien du site : la page d'accueil.
2. Créer **Bing Places** (utilisé par ChatGPT et Copilot) et **Apple Business Connect**.
3. Inscription aux annuaires : PagesJaunes, annuaire de la CCI de l'Aude, LinkedIn Entreprise, annuaires de partenaires BTP.
4. **Avis** : demander un avis Google à chaque client après une livraison, à un rythme régulier. Ne jamais filtrer les clients satisfaits avant de les envoyer vers Google. Répondre à tous les avis.
5. Dès 5 avis ou plus : section « Ils nous font confiance » sur l'accueil, avec les avis réels.

## 3. SEO IA (ChatGPT, Perplexity, Claude, AI Overviews) (P1-P2)
- **Robots** : autoriser GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended et Bingbot (voir `public/robots.txt`).
- **`/llms.txt`** fourni : garder à jour à chaque changement d'offre.
- **Blocs de réponse** : sur chaque page de service, placer juste sous le H1 un paragraphe de 40 à 60 mots qui dit ce qu'est le service, pour qui, où, et le premier pas (l'audit gratuit). Ce paragraphe doit se comprendre seul.
- **FAQ** : garder les 9 questions, formulées comme les clients les posent. Chaque réponse commence par la réponse directe.
- **Auteur et fraîcheur** : page À propos avec nom, rôle et parcours du fondateur. Afficher « Mis à jour le … » sur les pages de service et la FAQ, et renseigner `dateModified` dans le JSON-LD.
- **Chiffres** : n'utiliser que des chiffres réels (5 h/semaine, +30 %, +50 % sont déjà dans la maquette). Préciser leur source ou leur base quand c'est possible (« sur nos projets 2025-2026 »).
- **Présence tierce** : un profil LinkedIn actif avec des articles sur les sujets du site aide davantage les IA que le site seul.
- **Suivi mensuel** : poser 10 questions types à ChatGPT, Perplexity et Google (par ex. « logiciel sur mesure pour entreprise du BTP », « réceptionniste IA artisan », « agence référencement local Carcassonne »), 3 fois chacune, et noter le taux de citation.

## 4. UX et accessibilité (P1)
- **Contraste** : les couples de la maquette passent le seuil AA (#CBD5E1 et #94A3B8 sur #0B2F6B, #64748B sur #F8FAFC). Ne pas utiliser #94A3B8 sous 14 px sur #0A2A5E.
- **Image de fond du hero** : garder le voile navy (0,92 → 0,55) pour que le texte reste lisible quelle que soit la photo.
- **Focus** : garder `outline: 2px solid #F58220; outline-offset: 3px` sur tous les éléments interactifs.
- **Zones tactiles** : 44 × 44 px minimum sur mobile (burger, flèches des démos, questions de la FAQ).
- **Mouvement** : respecter `prefers-reduced-motion`. Les démos en lecture automatique doivent s'arrêter au survol, au focus et au premier clic, et proposer un bouton pause.
- **Formulaire** : libellés visibles (jamais seulement en placeholder), erreur affichée sous le champ concerné et reliée par `aria-describedby`, message de confirmation annoncé (`role="status"`). Case de consentement RGPD avec lien vers `/confidentialite/`. Protection anti-spam invisible (champ piège + limite de débit), pas de captcha visuel.
- **Envoi du formulaire** : e-mail transactionnel vers benjamin@vivopartner.com (par ex. Resend ou Brevo) avec accusé de réception automatique au prospect.
- **Mesure** : outil d'analyse sans cookies (Plausible ou Umami), avec événements `audit_cta_click`, `form_submit`, `tel_click`.

## 5. Avant la mise en ligne
- [ ] Domaine confirmé et redirections http→https et www→domaine principal
- [ ] Toutes les pages indexables, sitemap envoyé dans Google Search Console et Bing Webmaster Tools
- [ ] JSON-LD valide sur chaque page
- [ ] Même NAP sur le site, le JSON-LD et la fiche Google
- [ ] Lighthouse mobile ≥ 90 en performance, accessibilité et SEO
- [ ] Formulaire testé de bout en bout (envoi, accusé de réception, erreurs)
- [ ] Image og:image 1200 × 630 pour chaque page
