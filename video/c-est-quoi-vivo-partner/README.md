# Vidéo « C’est quoi Vivo Partner ? » (40 s)

Vidéo animée 1920×1080, 30 i/s, aux couleurs de la charte (marine, orange, Satoshi, Inter).
Ce dossier n’est pas publié sur le site : il ne fait partie ni de `src/` ni de `public/`.

## Fichiers

| Fichier | Usage |
|---|---|
| `vivo-partner-c-est-quoi-sous-titres.mp4` | Version réseaux sociaux : texte de la voix off incrusté |
| `vivo-partner-c-est-quoi-sans-sous-titres.mp4` | Version à monter avec la voix off enregistrée |
| `sous-titres.srt` | Sous-titres séparés (YouTube, LinkedIn, CapCut) |
| `miniature.jpg` | Image de couverture |

Les deux MP4 ont une piste son muette : la voix off reste à enregistrer, puis à poser dans CapCut ou un autre logiciel de montage sur la version sans sous-titres. Les temps du `.srt` suivent le découpage du script.

## Découpage

| Temps | Visuel |
|---|---|
| 0–3 s | Logo, « Alors… c’est quoi ? » |
| 3–8 s | Cartes Chantier / Téléphone / Ordinateur / Devis, « dédié aux entreprises du BTP » |
| 8–14 s | Page d’accueil du site, puis les 3 objectifs |
| 14–22 s | VISIBILITÉ, AUTOMATISATION, OUTILS MÉTIER, synchronisés sur la voix off |
| 22–29 s | Démos du site : résultats Google, réceptionniste IA, Aplomb |
| 29–35 s | Monogramme VP, puis « On comprend » et « On construit » |
| 35–40 s | Logo, accroche, tagline, vivopartner.com |

## Modifier et refaire le rendu

Les animations sont définies dans `video.html` (fonction `seek(t)`), et le texte des sous-titres dans `SUBS`.
Ouvrir `video.html` dans un navigateur pour la voir tourner en boucle.

```bash
cd video/c-est-quoi-vivo-partner
node preview.mjs 5 18 25          # captures prev-<t>.jpg aux instants donnés
node render.mjs 1 sortie.mp4      # avec sous-titres (0 = sans)
```

Nécessite Playwright (Chromium) et ffmpeg. `assets/` contient des captures des démos du site : à refaire si les démos changent.
