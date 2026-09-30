# Site Vivo Partner — v2 : changements

Fichier : `Site Vivo Partner v2.dc.html` (la v1 reste intacte).

## Conversion
- **Bug corrigé :** 7 boutons « Réserver un audit » ne menaient nulle part. Ils ouvrent maintenant la page Contact.
- « Découvrir les 3 leviers » fait défiler jusqu'à la section des démos.
- Formulaire : nom et téléphone obligatoires, message d'erreur clair, confirmation « Demande reçue » après envoi, bouton renommé « Envoyer ma demande d'audit gratuit ».
- Champ « Secteur » avec suggestions de métiers ; types tel/email et remplissage automatique sur mobile.

## Textes et psychologie
- Hero : sous-titre centré sur les 3 bénéfices (moins d'administratif, zéro appel manqué, plus de devis).
- Réassurance sous le CTA : 30 min en visio · Sans engagement · Mené par le fondateur · Réponse sous 24h.
- Aucune fausse urgence ni faux chiffre : seuls les chiffres déjà présents (5 h/semaine, +30 %, +50 %) sont réutilisés.

## SEO technique, local et IA
- Titres et descriptions revus par page : Carcassonne + toute la France + pays francophones.
- Balise canonique et og:url mis à jour page par page.
- Schema.org enrichi : ProfessionalService (SIRET, zone d'intervention, catalogue des 4 offres), WebSite, FAQPage (9 questions).
- 2 nouvelles questions FAQ, utiles pour Google et les IA : zone d'intervention et résultats attendus.
- Footer et page Contact : « Carcassonne (Aude) · France et pays francophones ».

## Accessibilité
- Tous les éléments cliquables (menu, onglets, FAQ, liens) sont utilisables au clavier (Tab + Entrée).
- Contour orange visible au focus clavier.
- Menu burger annoncé aux lecteurs d'écran (« Ouvrir le menu », ouvert/fermé).
- Logo : textes alternatifs dédoublonnés.

## À faire côté développeur / toi
- **Domaine :** j'ai supposé `vivopartner.com` (canonique, schema). À confirmer.
- **Formulaire :** la confirmation est visuelle ; il faut le brancher à un envoi réel (e-mail, CRM, Formspree…).
- **Pays servis dans le schema :** Belgique, Suisse, Luxembourg, Canada. À ajuster.
- **Preuves :** dès que tu as des avis clients ou une note Google, c'est le levier de confiance n°1 à ajouter (plus schema AggregateRating).
- Créer une fiche Google Business Profile pour Carcassonne et lier les réseaux (champ `sameAs` du schema).
- Mettre en place de vraies URLs par page (/aplomb/, /receptionniste-ia/…) au moment du développement.
