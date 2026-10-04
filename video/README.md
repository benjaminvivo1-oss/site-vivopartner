# VivoPartner — Trailer vidéo (Remotion)

Trailer commercial animé de 36,2 s, 30 i/s, en deux formats :

- `Trailer-16x9` — 1920 × 1080 (site, YouTube, LinkedIn)
- `Trailer-9x16` — 1080 × 1920 (ads Reels / TikTok / Shorts)

Motion design uniquement : interfaces animées, typographie cinétique, icônes. Aucun visage. Les 3 preuves chiffrées (une par pilier) viennent du brief client : textes et sources dans `TEXTS.proofs` (`src/config.ts`).

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
│       ├── S2Probleme.tsx      3,5 → 8,7 s
│       ├── S3Bascule.tsx      8,7 → 11,9 s
│       ├── S4Aplomb.tsx      11,9 → 16,4 s
│       ├── S5Receptionniste.tsx 16,4 → 24,8 s
│       ├── S6Visibilite.tsx  24,8 → 29,4 s
│       ├── S7Benefices.tsx   29,4 → 32,5 s
│       ├── S8Cta.tsx         32,5 → 36,2 s
│       └── index.ts             ← registre des scènes (type de transition d'entrée)
├── public/
│   ├── brand/   ← logos VP (copiés depuis src/assets/brand du site)
│   ├── fonts/   ← Satoshi + Inter (copiés depuis public/fonts du site)
│   └── audio/   ← music.mp3, vo/ (voix off), sfx/ (bruitages)
├── audio-sources/ ← prise originale de la voix off (ElevenLabs)
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
| Changer une preuve chiffrée ou sa source   | `TEXTS.proofs` dans `src/config.ts`                                            |
| Changer le dialogue du pilier 2            | `src/audio/dialogue.json` puis `npm run audio:dialogue`                        |
| Recaler les 3 impacts de la scène 7        | `BENEFIT_HITS` dans `src/scenes/S7Benefices.tsx`                               |

Le timing interne de chaque scène (apparition des cartes, des bulles, etc.) est regroupé dans une constante `T` / `BEAT` en tête de chaque fichier de scène.

## Bande-son

Le trailer est livré avec sa bande-son, déjà calée :

- **Voix off** : voix ElevenLabs (voix `jUHQdLfy668sllNiNTSW`, modèle multilingue), enregistrée d'une seule prise (`audio-sources/voix-off-elevenlabs.mp3`) puis découpée à ses pauses en 8 parties (`public/audio/vo/`), chacune placée dans sa scène (`src/audio/voiceover.json`). La musique s'abaisse automatiquement pendant la voix.
- **Musique** : `public/audio/music.mp3`, composée par programme (`scripts/generate_music_sfx.py`) : tension sombre jusqu'à la bascule, éclaircie sur le logo, groove sur les 3 piliers, montée sur les bénéfices, accord final.
- **Dialogue (pilier 2)** : client ↔ réceptionniste IA, sous-titré, musique baissée pendant l'échange (`src/audio/dialogue.json`). Voix provisoires tant que les prises ElevenLabs `audio-sources/dialogue-client.mp3` et `dialogue-ia.mp3` ne sont pas déposées.
- **Bruitages** : vibreur, notifications, feuilles qui tombent, tampon, tic-tac, pops d'interface, validations, souffles, scintillement du logo, pin qui tombe, impacts. Ils sont accrochés aux animations (`src/audio/sfx.ts`).

Régénérer :

```bash
pip install numpy scipy
npm run audio:music                       # musique + bruitages (suit SCENE_SECONDS)
ELEVENLABS_API_KEY=… npm run audio:voice  # voix off ElevenLabs : meilleure voix française choisie automatiquement
pip install kokoro-onnx soundfile
KOKORO_DIR=… npm run audio:voice          # ou voix gratuite hors ligne (Kokoro)
```

**Remplacer par une vraie voix** (recommandé pour une diffusion payante) : enregistrer le texte de `src/audio/voiceover.json` (8 parties, `vo-01` à `vo-08`), les déposer sous les mêmes noms dans `public/audio/vo/`, puis `npm run audio:durations` pour mettre à jour les durées. Une seule prise continue peut aussi être découpée.

## Crédits audio

- Voix off : générée avec ElevenLabs. Pour une diffusion commerciale (publicité), l'abonnement ElevenLabs utilisé pour la générer doit être payant (la formule gratuite n'autorise pas l'usage commercial).
- Musique et bruitages : synthétisés par `scripts/generate_music_sfx.py`, sans échantillon externe ; libres d'utilisation.

## Licence Remotion

Remotion est gratuit pour les particuliers et les entreprises de 3 salariés ou moins ; au-delà, une licence entreprise est requise (voir remotion.pro/license).
