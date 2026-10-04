# Voix off — calage sur les scènes

Durée totale : **33,6 s** à 30 i/s (1 008 images). Les timecodes ci-dessous correspondent à `SCENE_SECONDS` dans `src/config.ts` ; les animations sont jouées à la vitesse `SPEED` (1,6).

| Scène                | Timecode     | À l'écran                                                                  | Voix off                                                          |
| -------------------- | ------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1. Hook              | 00:00 → 03,5 | Téléphone qui sonne dès la 1re image, « Appel manqué » qui se multiplient | « Pendant que vous êtes sur le chantier… combien d'appels manquez-vous ? » |
| 2. Le problème       | 03,5 → 08,6  | Une illustration par phrase : devis en retard, e-mails non lus, appels jamais rappelés, horloge 17:00 → 22:00             | « Devis en retard, relances oubliées, appels oubliés, soirées perdues dans l'admin. » |
| 3. La bascule        | 08,6 → 11,2  | Écran blanc, logo VP, wordmark, question                                   | « Et si votre entreprise tournait toute seule ? »                 |
| 4. Aplomb            | 11,2 → 14,9  | Tableau de bord : devis, relances, avis, chantiers, graphique              | « Avec VivoPartner, vous automatisez votre gestion. »             |
| 5. Réceptionniste IA | 14,9 → 23,4  | Dialogue audio client ↔ IA (onde + sous-titres), RDV, preuve               | Dialogue, puis « Vous ne ratez plus un seul appel. »              |
| 6. Visibilité        | 23,4 → 27    | Pin Maps, fiche avec étoiles, site mobile, courbe de visites               | « Et vous devenez visible, là où vos clients vous cherchent. »    |
| 7. Bénéfices         | 27 → 30,1    | Trois impacts, un par phrase                                               | « Plus de devis. Plus de temps. Zéro client perdu. »              |
| 8. CTA               | 30,1 → 33,6  | Logo, tagline, vivopartner.com, bouton                                     | « VivoPartner. Automatise aujourd'hui, accélère demain. »         |

## Conseils d'enregistrement

- Débit soutenu : le texte complet tient en ≈ 23 s ; chaque phrase démarre quand son texte apparaît à l'écran (placement exact dans `src/audio/voiceover.json`).
- Scène 7 : les trois impacts (`BENEFIT_HITS`, `src/scenes/S7Benefices.tsx`) tombent sur « devis », « temps » et « perdu ».
- Musique : le temps fort (passage du sombre au lumineux) est sur la bascule, à 8,6 s.

## Voix off fournie

Voix ElevenLabs (voix `jUHQdLfy668sllNiNTSW`), une seule prise de 25,5 s (`audio-sources/voix-off-elevenlabs.mp3`) découpée à ses pauses en 8 parties (`public/audio/vo/vo-01.mp3` … `vo-08.mp3`). Les points de coupe sont notés dans `src/audio/voiceover.json` (champ `source`).

Pour une nouvelle prise : même texte, même ordre ; je redécoupe et je recale.

## Dialogue du pilier 2

Deux répliques (`src/audio/dialogue.json`), jouées avec la musique baissée, onde vocale calculée sur le son réel et sous-titres incrustés :

- Client : « Allô ? J'ai une fuite sous l'évier, vous pouvez passer ? » (filtre « téléphone » appliqué)
- Assistant IA : « Bien sûr ! Jeudi 9 h, ça vous va ? »

Voix ElevenLabs (client : voix d'homme inquiète ; IA : voix de femme chaleureuse). Pour les remplacer : déposer `audio-sources/dialogue-client.mp3` et `audio-sources/dialogue-ia.mp3`, puis `npm run audio:dialogue` : durées, placement, sous-titres, onde, voix off qui suit (`vo-05`) et durée de la scène se recalent seuls ; puis `npm run audio:music`.
