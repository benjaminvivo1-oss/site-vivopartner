# Mascotte Vivo Partner

`mascotte-vivopartner.png` : la planche de personnage adaptée à la marque.

- Sweat et fonds sombres : vert sapin → bleu marine de la marque (`#0B2F6B`), ombres et plis conservés.
- Logo de poitrine : remplacé partout par le vrai logo (V blanc, P orange `#F58220`, « Vivo / Partner »), y compris l'enseigne murale, l'écran en arrière-plan et les détails.
- Palette : marine `#0B2F6B` · orange `#F58220` · blanc · noir.

Sources dans `src/` : planche d'origine, `recolor.py` (changement de couleur), `relogo2.py` (remplacement des logos, positions mesurées à la main), `chest_logo.png` (logo de poitrine).

## Générer les poses en haute définition

La planche fait 1254 px : c'est une bonne référence, mais pour animer la mascotte en vidéo il faut chaque pose seule, en grand, sur fond transparent. Avec un outil d'image (ChatGPT, Gemini, Midjourney…), joindre `mascotte-vivopartner.png` et le logo, puis :

> Using the attached character sheet as the exact reference (same face, curly brown hair, Pixar-style 3D, same outfit), render the character ALONE, full body, [POSE], on a plain transparent background, 2048 px tall. Navy blue hoodie (#0B2F6B) with the attached "Vivo Partner" logo on the left chest (white V, orange #F58220 P, white serif text "Vivo / Partner"), black cargo pants, white sneakers, black smartwatch. Soft studio lighting, no text, no background.

Poses utiles pour les vidéos : salue de la main · pointe vers la caméra · pouce en l'air · explique (deux mains ouvertes) · réfléchit (main au menton) · tient une tablette · bras croisés, confiant.
