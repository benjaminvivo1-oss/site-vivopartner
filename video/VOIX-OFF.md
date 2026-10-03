# Voix off — calage sur les scènes

Durée totale : **60 s** à 30 i/s (1 800 images). Les timecodes ci-dessous correspondent à `SCENE_SECONDS` dans `src/config.ts`.

| Scène                | Timecode      | Images      | À l'écran                                                                             | Voix off                                                                   |
| -------------------- | ------------- | ----------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1. Hook              | 00:00 → 00:06 | 0 → 180     | Téléphone qui vibre, « Appel manqué » qui se multiplient                              | « Pendant que vous êtes sur le chantier, vos clients appellent ailleurs. » |
| 2. Le problème       | 00:06 → 00:16 | 180 → 480   | Devis qui s'empilent (6,3 s), horloge 17:00 → 22:00 (8,9 s), e-mails non lus (11,6 s) | « Devis en retard, relances oubliées, soirées perdues dans l'admin. »      |
| 3. La bascule        | 00:16 → 00:21 | 480 → 630   | Écran blanc, logo VP, wordmark, question (≈ 17,4 s)                                   | « Et si votre entreprise tournait toute seule ? »                          |
| 4. Aplomb            | 00:21 → 00:31 | 630 → 930   | Tableau de bord : devis, relances, avis, chantiers, graphique                         | « Avec VivoPartner, vous automatisez votre gestion, »                      |
| 5. Réceptionniste IA | 00:31 → 00:40 | 930 → 1200  | Onde vocale, transcription, RDV ajouté à l'agenda                                     | « vous ne ratez plus un seul appel, »                                      |
| 6. Visibilité        | 00:40 → 00:49 | 1200 → 1470 | Pin Maps, fiche avec étoiles, site mobile, courbe de visites                          | « et vous devenez visible là où vos clients vous cherchent. »              |
| 7. Bénéfices         | 00:49 → 00:54 | 1470 → 1620 | Impacts à 49,2 s / 50,3 s / 51,5 s                                                    | « Plus de devis, plus de temps, zéro client perdu. »                       |
| 8. CTA               | 00:54 → 01:00 | 1620 → 1800 | Logo, tagline, vivopartner.com, bouton                                                | « VivoPartner. Automatise aujourd'hui, accélère demain. »                  |

## Conseils d'enregistrement

- Le texte complet se lit en ≈ 35 s à un débit posé : chaque phrase démarre **au début de sa scène**, on laisse respirer la musique ensuite.
- Scènes 4 à 6 : la phrase « Avec VivoPartner, vous automatisez votre gestion, vous ne ratez plus un seul appel, et vous devenez visible… » est découpée en trois morceaux, un par pilier. Laisser ~5 s de silence après chaque morceau (ou exporter trois fichiers et les placer à 21 s, 31 s et 40 s).
- Scène 7 : les trois impacts sont réglables dans `BENEFIT_HITS` (`src/scenes/S7Benefices.tsx`) pour tomber pile sur « devis », « temps » et « perdu ».
- Musique : un temps fort (drop / changement d'ambiance) à **16 s** pour la bascule, du sombre vers le lumineux.

## Ajouter l'audio

1. Déposer les fichiers dans `video/public/audio/` (ex. `musique.mp3`, `voix-off.mp3`).
2. Dans `src/config.ts`, renseigner `AUDIO.music = 'audio/musique.mp3'` et `AUDIO.voiceover = 'audio/voix-off.mp3'`.
3. Ajuster `musicVolume` (0,35 par défaut, sous la voix) et, si besoin, `voiceoverOffset`.
