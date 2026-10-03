# VivoPartner — Trailer vidéo (Remotion)

Trailer commercial animé de 32 s, 30 i/s, en deux formats :

- `Trailer-16x9` — 1920 × 1080 (site, YouTube, LinkedIn)
- `Trailer-9x16` — 1080 × 1920 (ads Reels / TikTok / Shorts)

Motion design uniquement : interfaces animées, typographie cinétique, icônes. Aucun visage, aucun chiffre ni statistique inventé.

## Commandes

```bash
cd video
npm install

# Preview interactive (Remotion Studio, http://localhost:3000)
npm run dev

# Export MP4
npm run render            # → out/vivopartner-trailer-16x9.mp4
npm run render:vertical   # → out/vivopartner-trailer-9x16.mp4
npm run render:all        # les deux

# Exporter une seule scène (ex. la scène 4 en vertical)
npx remotion render src/index.ts S4-Aplomb-9x16 out/s4.mp4
```

Pré-requis : Node 18+. Remotion télécharge lui-même Chrome Headless au premier rendu.

## Structure

```
video/
├── src/
│   ├── config.ts          ← TOUT ce qui se règle : couleurs, polices, durées, textes, audio
│   ├── Root.tsx           ← déclaration des compositions (2 trailers + 8 scènes × 2 formats)
│   ├── Trailer.tsx        ← composition principale : enchaîne les scènes + audio
│   ├── fonts.ts           ← chargement de Satoshi et Inter (public/fonts)
│   ├── anim.ts            ← helpers d'animation (ressorts, easing, mise en page 16:9 / 9:16)
│   ├── components/        ← WordReveal (mot par mot), Phone, Logo animé, Icon, cartes…
│   └── scenes/
│       ├── S1Hook.tsx            0 → 3,5 s
│       ├── S2Probleme.tsx      3,5 → 8,5 s
│       ├── S3Bascule.tsx      8,5 → 11,7 s
│       ├── S4Aplomb.tsx      11,7 → 16,2 s
│       ├── S5Receptionniste.tsx 16,2 → 20,7 s
│       ├── S6Visibilite.tsx  20,7 → 25,3 s
│       ├── S7Benefices.tsx   25,3 → 28,1 s
│       ├── S8Cta.tsx         28,1 → 32 s
│       └── index.ts             ← registre des scènes (type de transition d'entrée)
├── public/
│   ├── brand/   ← logos VP (copiés depuis src/assets/brand du site)
│   ├── fonts/   ← Satoshi + Inter (copiés depuis public/fonts du site)
│   └── audio/   ← music.mp3, vo/ (voix off), sfx/ (bruitages)
├── scripts/     ← générateurs audio (voix off, musique, bruitages)
└── VOIX-OFF.md  ← timecodes de la voix off scène par scène
```

## Modifier

| Je veux…                                   | Où                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Changer une couleur                        | `COLORS` dans `src/config.ts`                                                  |
| Changer un texte à l'écran                 | `TEXTS` dans `src/config.ts` (un mot entre `*astérisques*` passe en orange)    |
| Rallonger / raccourcir une scène           | `SCENE_SECONDS` : les scènes suivantes se décalent automatiquement             |
| Accélérer / ralentir toutes les animations | `SPEED` (1,6 par défaut ; les bruitages suivent)                               |
| Ralentir l'apparition mot par mot          | `WORD_STAGGER`                                                                 |
| Adoucir / dynamiser les animations         | `SPRINGS`                                                                      |
| Durée des fondus entre scènes              | `CROSSFADE_FRAMES`                                                             |
| Couper / doser musique, voix, bruitages    | `AUDIO` dans `src/config.ts` (volumes, atténuation de la musique sous la voix) |
| Changer une phrase de la voix off          | `src/audio/voiceover.json` puis `npm run audio:voice`                          |
| Déplacer ou ajouter un bruitage            | `src/audio/sfx.ts`                                                             |
| Recaler les 3 impacts de la scène 7        | `BENEFIT_HITS` dans `src/scenes/S7Benefices.tsx`                               |

Le timing interne de chaque scène (apparition des cartes, des bulles, etc.) est regroupé dans une constante `T` / `BEAT` en tête de chaque fichier de scène.

## Bande-son

Le trailer est livré avec sa bande-son, déjà calée :

- **Voix off** : voix française de synthèse (Piper, voix « siwis »), une phrase par fichier dans `public/audio/vo/`, placée à son timecode par `src/audio/voiceover.json`. La musique s'abaisse automatiquement pendant chaque phrase.
- **Musique** : `public/audio/music.mp3`, composée par programme (`scripts/generate_music_sfx.py`) : tension sombre jusqu'à la bascule, éclaircie sur le logo, groove sur les 3 piliers, montée sur les bénéfices, accord final.
- **Bruitages** : vibreur, notifications, feuilles qui tombent, tampon, tic-tac, pops d'interface, validations, souffles, scintillement du logo, pin qui tombe, impacts. Ils sont accrochés aux animations (`src/audio/sfx.ts`).

Régénérer :

```bash
pip install numpy scipy
npm run audio:music                       # musique + bruitages (suit SCENE_SECONDS)
PIPER_BIN=… PIPER_MODEL=…/fr-siwis-medium.onnx npm run audio:voice   # voix off (voir l'en-tête du script)
```

**Remplacer par une vraie voix** (recommandé pour une diffusion payante) : enregistrer les 14 phrases de `src/audio/voiceover.json`, les déposer sous les mêmes noms dans `public/audio/vo/` (`vo-01.mp3` …), puis `npm run audio:durations` pour mettre à jour les durées. Une seule prise continue peut aussi être découpée.

## Crédits audio

- Voix off : modèle Piper « fr_FR siwis medium », entraîné sur la base SIWIS French Speech Synthesis (University of Edinburgh), licence **CC-BY 4.0** : la mention « Voix : SIWIS (CC-BY 4.0) » doit figurer quelque part (description de la vidéo, par exemple) tant que cette voix est utilisée.
- Musique et bruitages : synthétisés par `scripts/generate_music_sfx.py`, sans échantillon externe ; libres d'utilisation.

## Licence Remotion

Remotion est gratuit pour les particuliers et les entreprises de 3 salariés ou moins ; au-delà, une licence entreprise est requise (voir remotion.pro/license).
