# Voix off : « Vivo Partner, c'est quoi ? »

Une seule voix : **la mascotte**. Elle sera enregistrée par Benjamin lui-même : texte et conseils d'enregistrement dans [`TEXTE-A-LIRE.md`](TEXTE-A-LIRE.md). En attendant, la vidéo utilise une voix ElevenLabs provisoire (« confident Viv »). La mascotte, c'est Benjamin Vivo, le fondateur, en version cartoon : elle le dit elle-même (« … fondé par moi, Benjamin Vivo ») pendant le temps fort du fondateur : son avatar en grand, « Fondé par Benjamin Vivo » et « Fondateur · Carcassonne ».

Quand elle est à l'écran et qu'elle parle, sa bouche bouge et une bulle avec des ondes sonores apparaît à côté de sa tête. Quand elle n'est pas à l'écran, elle continue de raconter comme une narratrice.

Les minutages correspondent à `vivopartner-cest-quoi-9x16.mp4` (40,6 s). Un écart de ±0,3 s ne pose pas de problème. Débit : environ 3 mots par seconde.

| Début | Fin | État | Texte |
| --- | --- | --- | --- |
| 0:00,4 | 0:01,9 | Enregistré | Vivo Partner, c'est quoi ? |
| 0:03,6 | 0:08,4 | **À enregistrer** | Un partenaire de croissance digitale dédié aux entreprises du BTP, fondé par moi, Benjamin Vivo. |
| 0:08,7 | 0:13,7 | **À enregistrer** | Notre objectif : développer votre activité, gagner du temps, et ne plus laisser passer d'opportunités. |
| 0:13,9 | 0:19,5 | Enregistré | Trois leviers : la visibilité, notre réceptionniste IA, et Aplomb, notre outil métier sur mesure. |
| 0:19,6 | 0:22,7 | Enregistré | Et surtout : pas une solution toute faite, la même pour tous. |
| 0:23,3 | 0:27,4 | **À enregistrer** | On s'adapte à vous, à votre entreprise, à vos process. Et pas l'inverse. |
| 0:28,8 | 0:31,7 | Enregistré | On commence par comprendre votre entreprise, avec un audit. |
| 0:32,0 | 0:34,5 | Enregistré | Puis on construit ce dont vous avez réellement besoin. |
| 0:34,8 | 0:36,5 | **À enregistrer** | Plus de clients. Plus de temps. Zéro opportunité perdue. |
| 0:37,2 | 0:40,2 | Enregistré | Vivo Partner. Réservez votre diagnostic gratuit. |

« … fondé par moi, Benjamin Vivo » tombe vers 0:07,0 : la mascotte en tenue de chantier parle et l'écran passe au temps fort du fondateur (0:06,9 – 0:08,5).

Les phrases enregistrées sont dans `voix/mascotte-elevenlabs.mp3`. Elles sont découpées et placées par `voix/build_voice.py` ; la phrase « Trois leviers… » est accélérée de 6 % pour tenir dans la scène. La bouche suit le volume réel de la voix et la musique baisse pendant qu'elle parle (`voix/mix.py`). Pour la mascotte en tenue de chantier, en attendant l'enregistrement, la bouche suit un rythme générique.

Texte à générer dans ElevenLabs (même voix, mêmes réglages), d'un seul bloc :

> Un partenaire de croissance digitale dédié aux entreprises du BTP, fondé par moi, Benjamin Vivo. … Notre objectif : développer votre activité, gagner du temps, et ne plus laisser passer d'opportunités. … On s'adapte à vous, à votre entreprise, à vos process. Et pas l'inverse. … Plus de clients. Plus de temps. Zéro opportunité perdue.
