# VivoPartner — Trailer vidéo (Remotion)

Trailer commercial animé de 60 s, 30 i/s, en deux formats :

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
│       ├── S1Hook.tsx            0 → 6 s
│       ├── S2Probleme.tsx        6 → 16 s
│       ├── S3Bascule.tsx        16 → 21 s
│       ├── S4Aplomb.tsx         21 → 31 s
│       ├── S5Receptionniste.tsx 31 → 40 s
│       ├── S6Visibilite.tsx     40 → 49 s
│       ├── S7Benefices.tsx      49 → 54 s
│       ├── S8Cta.tsx            54 → 60 s
│       └── index.ts             ← registre des scènes (type de transition d'entrée)
├── public/
│   ├── brand/   ← logos VP (copiés depuis src/assets/brand du site)
│   ├── fonts/   ← Satoshi + Inter (copiés depuis public/fonts du site)
│   └── audio/   ← à créer : musique et voix off
└── VOIX-OFF.md  ← timecodes de la voix off scène par scène
```

## Modifier

| Je veux…                            | Où                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Changer une couleur                 | `COLORS` dans `src/config.ts`                                               |
| Changer un texte à l'écran          | `TEXTS` dans `src/config.ts` (un mot entre `*astérisques*` passe en orange) |
| Rallonger / raccourcir une scène    | `SCENE_SECONDS` : les scènes suivantes se décalent automatiquement          |
| Ralentir l'apparition mot par mot   | `WORD_STAGGER`                                                              |
| Adoucir / dynamiser les animations  | `SPRINGS`                                                                   |
| Durée des fondus entre scènes       | `CROSSFADE_FRAMES`                                                          |
| Ajouter musique et voix off         | `AUDIO` + fichiers dans `public/audio/` (voir `VOIX-OFF.md`)                |
| Recaler les 3 impacts de la scène 7 | `BENEFIT_HITS` dans `src/scenes/S7Benefices.tsx`                            |

Le timing interne de chaque scène (apparition des cartes, des bulles, etc.) est regroupé dans une constante `T` / `BEAT` en tête de chaque fichier de scène.

## Licence Remotion

Remotion est gratuit pour les particuliers et les entreprises de 3 salariés ou moins ; au-delà, une licence entreprise est requise (voir remotion.pro/license).
