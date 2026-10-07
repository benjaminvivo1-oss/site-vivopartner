# Mascotte Vivo Partner

`mascotte-vivopartner-2.png` : la planche complète (poses utiles, expressions, angles, au bureau, sur le chantier) adaptée à la marque. Le casque de chantier porte la marque VP marine et orange, et l'ordinateur le logo gravé.

`mascotte-vivopartner.png` : la première planche adaptée.

- Sweat et fonds sombres : vert sapin → bleu marine de la marque (`#0B2F6B`), ombres et plis conservés.
- Logo de poitrine : remplacé partout par le vrai logo (V blanc, P orange `#F58220`, « Vivo / Partner »), y compris l'enseigne murale, l'écran en arrière-plan et les détails.
- Palette : marine `#0B2F6B` · orange `#F58220` · blanc · noir.

Sources dans `src/` (et `src/planche-2/` pour la seconde planche) : planche d'origine, `recolor.py` (changement de couleur), `relogo2.py` (remplacement des logos, positions mesurées à la main), `chest_logo.png` (logo de poitrine).

## Générer les poses en haute définition

La planche fait 1254 px : c'est une bonne référence, mais pour animer la mascotte en vidéo il faut chaque pose seule, en grand, sur fond transparent. Avec un outil d'image (ChatGPT, Gemini, Midjourney…), joindre `mascotte-vivopartner.png` et le logo, puis :

> Using the attached character sheet as the exact reference (same face, curly brown hair, Pixar-style 3D, same outfit), render the character ALONE, full body, [POSE], on a plain transparent background, 2048 px tall. Navy blue hoodie (#0B2F6B) with the attached "Vivo Partner" logo on the left chest (white V, orange #F58220 P, white serif text "Vivo / Partner"), black cargo pants, white sneakers, black smartwatch. Soft studio lighting, no text, no background.

Poses utiles pour les vidéos : salue de la main · pointe vers la caméra · pouce en l'air · explique (deux mains ouvertes) · réfléchit (main au menton) · tient une tablette · bras croisés, confiant.

## Poses détourées

`poses/` : salue, explique, réfléchit, pointe vers la caméra, chantier (casque, dôme reconstruit car coupé par la vignette) et bureau (ordinateur) — extraites de la planche 2, agrandies ×4 (EDSR) et détourées sur fond transparent. Elles servent dans la vidéo de présentation ; pour un usage en grand (affiche, site), mieux vaut générer les poses en haute définition avec le prompt ci-dessus.

## Photos de profil

`profil/photo-profil-navy.png`, `photo-profil-orange.png` et `photo-profil-clair.png` : 1080 × 1080 px, mascotte bras croisés (logo VP visible) dans un anneau, aux couleurs de Vivo Partner. Le cadrage est prévu pour un recadrage rond (Instagram, Facebook, LinkedIn, TikTok, WhatsApp, Google) : la tête reste entière dans le cercle. Versions fond blanc avec le logo VP en grand derrière la mascotte : `photo-profil-clair-logo.png` (logo en couleurs) et `photo-profil-clair-logo-discret.png` (logo en filigrane) ; le logo est agrandi couleur par couleur avec des bords resserrés pour rester net. Le logo du sweat est remplacé par le vrai logo (net, incliné comme le sweat, ombré par les plis) : `src/relogo.py`. Régénérer : `python3 src/profil.py ../src/assets/masc_bras.png profil`.

## Bannière

`banniere/banniere-linkedin-mascotte.png` (2000 × 500, format LinkedIn) : la bannière d'origine (`banniere-linkedin-originale.webp`) avec la mascotte bras croisés devant la diagonale orange, hors de la zone couverte par la photo de profil sur LinkedIn (en bas à gauche) et sans toucher le texte. Régénérer : `python3 src/banniere.py ../src/assets/masc_bras.png banniere/banniere-linkedin-originale.webp banniere/banniere-linkedin-mascotte.png 560` (le dernier nombre est la position horizontale du visage).
