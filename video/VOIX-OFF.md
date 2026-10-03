# Voix off — calage sur les scènes

Durée totale : **36 s** à 30 i/s (1 080 images). Les timecodes ci-dessous correspondent à `SCENE_SECONDS` dans `src/config.ts` ; les animations sont jouées à la vitesse `SPEED` (1,6).

| Scène                | Timecode     | À l'écran                                                     | Voix off                                                                   |
| -------------------- | ------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1. Hook              | 00:00 → 03,5 | Téléphone qui vibre, « Appel manqué » qui se multiplient      | « Pendant que vous êtes sur le chantier, vos clients appellent ailleurs. » |
| 2. Le problème       | 03,5 → 08,5  | Devis qui s'empilent, horloge 17:00 → 22:00, e-mails non lus  | « Devis en retard, relances oubliées, soirées perdues dans l'admin. »      |
| 3. La bascule        | 08,5 → 11,7  | Écran blanc, logo VP, wordmark, question                      | « Et si votre entreprise tournait toute seule ? »                          |
| 4. Aplomb            | 11,7 → 16,2  | Tableau de bord : devis, relances, avis, chantiers, graphique | « Avec VivoPartner, vous automatisez votre gestion. »                      |
| 5. Réceptionniste IA | 16,2 → 24,6  | Dialogue audio client ↔ IA (onde + sous-titres), RDV, preuve  | Dialogue, puis « Vous ne ratez plus un seul appel. »                       |
| 6. Visibilité        | 24,6 → 29,2  | Pin Maps, fiche avec étoiles, site mobile, courbe de visites  | « Et vous devenez visible, là où vos clients vous cherchent. »             |
| 7. Bénéfices         | 29,2 → 32,3  | Trois impacts, un par phrase                                  | « Plus de devis. Plus de temps. Zéro client perdu. »                       |
| 8. CTA               | 32,3 → 36    | Logo, tagline, vivopartner.com, bouton                        | « VivoPartner. Automatise aujourd'hui, accélère demain. »                  |

## Conseils d'enregistrement

- Débit soutenu : le texte complet tient en ≈ 21 s ; chaque phrase démarre quand son texte apparaît à l'écran (placement exact dans `src/audio/voiceover.json`).
- Scène 7 : les trois impacts (`BENEFIT_HITS`, `src/scenes/S7Benefices.tsx`) tombent sur « devis », « temps » et « perdu ».
- Musique : le temps fort (passage du sombre au lumineux) est sur la bascule, à 8,5 s.

## Voix off fournie

Voix ElevenLabs (voix `jUHQdLfy668sllNiNTSW`), une seule prise de 24,7 s (`audio-sources/voix-off-elevenlabs.mp3`) découpée à ses pauses en 8 parties (`public/audio/vo/vo-01.mp3` … `vo-08.mp3`). Les points de coupe sont notés dans `src/audio/voiceover.json` (champ `source`).

Pour une nouvelle prise : même texte, même ordre ; je redécoupe et je recale.

## Dialogue du pilier 2

Deux répliques (`src/audio/dialogue.json`), jouées avec la musique baissée, onde vocale calculée sur le son réel et sous-titres incrustés :

- Client : « Bonjour, j'ai une fuite sous l'évier, vous pouvez passer ? » (filtre « téléphone » appliqué)
- Assistant IA : « Bien sûr. Je vous propose jeudi à 9 h, ça vous convient ? »

Les voix actuelles sont **provisoires** (synthèse locale). Pour les voix finales ElevenLabs : déposer `audio-sources/dialogue-client.mp3` et `audio-sources/dialogue-ia.mp3`, puis `npm run audio:dialogue` : durées, placement, sous-titres et onde se recalent seuls.
