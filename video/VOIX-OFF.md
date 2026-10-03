# Voix off — calage sur les scènes

Durée totale : **32 s** à 30 i/s (960 images). Les timecodes ci-dessous correspondent à `SCENE_SECONDS` dans `src/config.ts` ; les animations sont jouées à la vitesse `SPEED` (1,6).

| Scène                | Timecode     | À l'écran                                                     | Voix off                                                                   |
| -------------------- | ------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1. Hook              | 00:00 → 03,5 | Téléphone qui vibre, « Appel manqué » qui se multiplient      | « Pendant que vous êtes sur le chantier, vos clients appellent ailleurs. » |
| 2. Le problème       | 03,5 → 08,5  | Devis qui s'empilent, horloge 17:00 → 22:00, e-mails non lus  | « Devis en retard, relances oubliées, soirées perdues dans l'admin. »      |
| 3. La bascule        | 08,5 → 11,7  | Écran blanc, logo VP, wordmark, question                      | « Et si votre entreprise tournait toute seule ? »                          |
| 4. Aplomb            | 11,7 → 16,2  | Tableau de bord : devis, relances, avis, chantiers, graphique | « Avec VivoPartner, vous automatisez votre gestion. »                      |
| 5. Réceptionniste IA | 16,2 → 20,7  | Onde vocale, transcription, RDV ajouté à l'agenda             | « Vous ne ratez plus un seul appel. »                                      |
| 6. Visibilité        | 20,7 → 25,3  | Pin Maps, fiche avec étoiles, site mobile, courbe de visites  | « Et vous devenez visible, là où vos clients vous cherchent. »             |
| 7. Bénéfices         | 25,3 → 28,1  | Trois impacts, un par phrase                                  | « Plus de devis. Plus de temps. Zéro client perdu. »                       |
| 8. CTA               | 28,1 → 32    | Logo, tagline, vivopartner.com, bouton                        | « VivoPartner. Automatise aujourd'hui, accélère demain. »                  |

## Conseils d'enregistrement

- Débit soutenu : le texte complet tient en ≈ 21 s ; chaque phrase démarre quand son texte apparaît à l'écran (placement exact dans `src/audio/voiceover.json`).
- Scène 7 : les trois impacts (`BENEFIT_HITS`, `src/scenes/S7Benefices.tsx`) tombent sur « devis », « temps » et « perdu ».
- Musique : le temps fort (passage du sombre au lumineux) est sur la bascule, à 8,5 s.

## Voix off fournie

Voix de synthèse Kokoro (française), en 6 prises dites d'une traite, découpées en 8 parties (`public/audio/vo/vo-01.mp3` … `vo-08.mp3`) ; placement dans `src/audio/voiceover.json`.

Pour la remplacer par un enregistrement : une partie par fichier, mêmes noms, puis `npm run audio:durations`.
