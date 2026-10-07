# Voix off : « Vivo Partner, c'est quoi ? »

**Voix : Benjamin Vivo**, enregistrée au téléphone (`voix/benjamin-voix-off.m4a`). La mascotte, c'est Benjamin en version cartoon : quand elle est à l'écran et qu'elle parle, sa bouche suit sa voix et une bulle avec des ondes sonores apparaît à côté de sa tête. Quand elle n'est pas à l'écran, la voix continue comme une narration.

La vidéo suit la voix : chaque scène dure le temps de ce qui est dit, et les textes apparaissent sur les mots prononcés.

| Début | Texte dit (vidéo de 49,8 s) |
| --- | --- |
| 0:00,4 | Vivo Partner, c'est quoi ? |
| 0:03,6 | Un partenaire de croissance digitale dédié aux entreprises du BTP, fondé par moi, Benjamin Vivo. *(« fondé par moi » à 0:07,3 : temps fort du fondateur)* |
| 0:10,5 | Notre objectif : développer votre activité, vous faire gagner du temps, et ne plus laisser passer d'opportunités. |
| 0:17,0 | Tout ça grâce à trois leviers : la visibilité, notre réceptionniste IA, et Aplomb, notre outil métier sur mesure. |
| 0:24,6 | Mais ce n'est pas un pack tout fait, copié-collé pour tout le monde. |
| 0:28,1 | Nous, on s'adapte à vous, votre entreprise, vos process, et pas l'inverse. |
| 0:33,6 | On commence par comprendre votre entreprise, avec un audit gratuit, |
| 0:37,5 | puis on construit ce dont vous avez réellement besoin. |
| 0:40,6 | Plus de clients, plus de temps pour vous, zéro opportunité perdue. |
| 0:45,1 | Vivo Partner. Réservez votre diagnostic gratuit. |

## Comment la voix est montée

1. `voix/traitement.sh` : coupe-bas (75 Hz), moins de « boue » (−2,5 dB à 250 Hz), plus de présence (+2,5 dB à 3,2 kHz) et d'air, dé-esseur, compression douce, normalisation (−16 LUFS).
2. `voix/placement.py` : l'enregistrement est découpé en un bloc continu par scène (les pauses naturelles sont gardées). Le script calcule :
   - où placer chaque bloc ;
   - la déformation du temps de l'animation (`WARP`), entre −14 % et +28 % de la vitesse d'origine ;
   - les moments de l'animation calés sur les mots (`VOICE_T`) ;
   - les plages où la mascotte parle (`VOICE_TALK`) → `src/layout.json`.
3. `voix/build_track.py` : place les blocs sur la timeline et écrit la piste voix et `src/assets/voice-env.js` (enveloppe de la bouche, 60 valeurs par seconde, et les données ci-dessus).
4. `voix/mix.py` : musique discrète en fond (−13 dB), encore plus basse quand la voix parle (environ 17 dB sous la voix), puis le tout est normalisé à −14 LUFS.

Pour un nouvel enregistrement, relancer ces étapes. Si le texte ou le rythme change, mettre à jour dans `voix/placement.py` les temps de début et de fin des blocs et des mots repères (secondes dans l'enregistrement).
