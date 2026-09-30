# SEO & référencement local — à faire à la publication

## Déjà intégré dans le site
- Titre et description uniques par page, langue `fr`
- Un seul H1 par page, contenant le mot-clé principal
- Données structurées Schema.org (ProfessionalService) : nom, fondateur, e-mail, téléphone, Carcassonne, zone desservie (Aude, Occitanie, France)
- Balises Open Graph (partage réseaux sociaux), balises géographiques FR-11
- Textes alternatifs sur le logo

## À faire par vous (indispensable pour le local)
1. **Fiche Google Business Profile** : catégorie « Consultant en marketing » ou « Service de conception de sites Web », adresse ou zone desservie Carcassonne/Aude, lien vers le site, photos (locaux, logo), demander des avis clients dès les premiers projets.
2. **Même NAP partout** : nom, adresse, téléphone identiques au caractère près sur le site, Google, Pages Jaunes, LinkedIn, Facebook, Instagram (@vivopartner).
3. **Ajouter l'adresse postale complète** (rue) dans le pied de page et dans les données structurées si vous recevez des clients.
4. **Ajouter les liens réseaux sociaux** dans le champ `sameAs` des données structurées.
5. **Google Search Console** : vérifier le domaine, soumettre le sitemap.
6. **Image de partage** (1200×630) : ajouter `og:image`.

## À faire par le développeur à l'intégration
- Une vraie URL par page (`/aplomb`, `/receptionniste-ia`, `/visibilite`, `/a-propos`, `/contact`, `/faq`, `/mentions-legales`) avec rendu côté serveur ou pré-rendu : aujourd'hui les pages changent sans changer d'URL, Google ne verrait que l'accueil.
- Balise `<link rel="canonical">` par page
- `robots.txt` + `sitemap.xml` (modèles ci-dessous)
- Schéma FAQPage sur la page FAQ
- HTTPS, compression des images en WebP, score PageSpeed mobile > 90

### robots.txt
```
User-agent: *
Allow: /
Sitemap: https://vivopartner.com/sitemap.xml
```

### sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://vivopartner.com/</loc></url>
  <url><loc>https://vivopartner.com/aplomb</loc></url>
  <url><loc>https://vivopartner.com/receptionniste-ia</loc></url>
  <url><loc>https://vivopartner.com/visibilite</loc></url>
  <url><loc>https://vivopartner.com/a-propos</loc></url>
  <url><loc>https://vivopartner.com/contact</loc></url>
  <url><loc>https://vivopartner.com/faq</loc></url>
  <url><loc>https://vivopartner.com/mentions-legales</loc></url>
</urlset>
```
