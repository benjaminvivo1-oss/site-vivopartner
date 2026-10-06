# Voix off : « Vivo Partner, c'est quoi ? »

Une seule voix : **la mascotte** (voix ElevenLabs « confident Viv »). La mascotte, c'est Benjamin, le fondateur, en version cartoon : elle se présente au début (« Salut ! Moi c'est Benjamin… ») avec une étiquette « Benjamin · Fondateur · Vivo Partner · Carcassonne ».

Quand elle est à l'écran et qu'elle parle, sa bouche bouge et une bulle avec des ondes sonores apparaît à côté de sa tête. Quand elle n'est pas à l'écran, elle continue de raconter comme une narratrice.

Les minutages correspondent à `vivopartner-cest-quoi-9x16.mp4` (43,8 s). Un écart de ±0,3 s ne pose pas de problème. Débit : environ 3 mots par seconde.

| Début | Fin | État | Texte |
| --- | --- | --- | --- |
| 0:00,3 | 0:02,7 | **À enregistrer** | Salut ! Moi c'est Benjamin, fondateur de Vivo Partner. |
| 0:03,6 | 0:05,0 | Enregistré | Vivo Partner, c'est quoi ? |
| 0:06,8 | 0:10,8 | **À enregistrer** | Un partenaire de croissance digitale pour toutes les entreprises du BTP, basé à Carcassonne. |
| 0:11,8 | 0:17,0 | **À enregistrer** | Notre objectif : développer votre activité, gagner du temps, et ne plus laisser passer d'opportunités. |
| 0:17,1 | 0:22,7 | Enregistré | Trois leviers : la visibilité, notre réceptionniste IA, et Aplomb, notre outil métier sur mesure. |
| 0:22,8 | 0:25,9 | Enregistré | Et surtout : pas une solution toute faite, la même pour tous. |
| 0:26,5 | 0:30,6 | **À enregistrer** | On s'adapte à vous, à votre entreprise, à vos process. Et pas l'inverse. |
| 0:32,0 | 0:34,9 | Enregistré | On commence par comprendre votre entreprise, avec un audit. |
| 0:35,2 | 0:37,7 | Enregistré | Puis on construit ce dont vous avez réellement besoin. |
| 0:38,0 | 0:39,7 | **À enregistrer** | Plus de clients. Plus de temps. Zéro opportunité perdue. |
| 0:40,4 | 0:43,4 | Enregistré | Vivo Partner. Réservez votre diagnostic gratuit. |

Les phrases enregistrées sont dans `voix/mascotte-elevenlabs.mp3`. Elles sont découpées et placées par `voix/build_voice.py` ; la phrase « Trois leviers… » est accélérée de 6 % pour tenir dans la scène. La bouche suit le volume réel de la voix et la musique baisse pendant qu'elle parle (`voix/mix.py`). Pour l'intro, en attendant l'enregistrement, la bouche suit un rythme générique.

Texte à générer dans ElevenLabs (même voix, mêmes réglages), d'un seul bloc :

> Salut ! Moi c'est Benjamin, fondateur de Vivo Partner. … Un partenaire de croissance digitale pour toutes les entreprises du BTP, basé à Carcassonne. … Notre objectif : développer votre activité, gagner du temps, et ne plus laisser passer d'opportunités. … On s'adapte à vous, à votre entreprise, à vos process. Et pas l'inverse. … Plus de clients. Plus de temps. Zéro opportunité perdue.
