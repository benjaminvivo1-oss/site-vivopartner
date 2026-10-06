# Voix off : « Vivo Partner, c'est quoi ? »

Les minutages correspondent à l'apparition du texte à l'écran dans `vivopartner-cest-quoi-9x16.mp4` (40,6 s). Un écart de ±0,3 s ne pose pas de problème.

Deux voix :

- **Mascotte** : une voix dédiée (par exemple une voix ElevenLabs), un peu plus jeune et enjouée. Elle parle uniquement quand elle est à l'écran : à ces moments-là, sa bouche bouge et une bulle avec des ondes sonores apparaît à côté de sa tête.
- **Fondateur** : ta voix, posée et confiante. Elle explique pendant que la mascotte n'est pas à l'écran (ou qu'elle est en tenue de chantier, muette).

Débit : environ 3 mots par seconde.

| Début | Fin | Qui parle | Texte |
| --- | --- | --- | --- |
| 0:00,4 | 0:01,6 | Mascotte | Vivo Partner, c'est quoi ? |
| 0:03,6 | 0:07,6 | Fondateur | Un partenaire de croissance digitale pour toutes les entreprises du BTP, basé à Carcassonne. |
| 0:08,6 | 0:13,8 | Fondateur | Notre objectif : développer votre activité, gagner du temps, et ne plus laisser passer d'opportunités. |
| 0:13,9 | 0:19,5 | Mascotte | Trois leviers : la visibilité, notre réceptionniste IA, et Aplomb, notre outil métier sur mesure. |
| 0:19,7 | 0:22,7 | Mascotte | Et surtout : pas une solution toute faite, la même pour tous. |
| 0:23,3 | 0:27,4 | Fondateur | On s'adapte à vous, à votre entreprise, à vos process. Et pas l'inverse. |
| 0:28,8 | 0:31,5 | Mascotte | On commence par comprendre votre entreprise, avec un audit. |
| 0:32,0 | 0:34,5 | Mascotte | Puis on construit ce dont vous avez réellement besoin. |
| 0:34,8 | 0:36,5 | Fondateur | Plus de clients. Plus de temps. Zéro opportunité perdue. |
| 0:37,2 | 0:40,2 | Mascotte | Vivo Partner. Réservez votre diagnostic gratuit. |

**Voix de la mascotte : enregistrée** (`voix/mascotte-elevenlabs.mp3`, ElevenLabs). Elle est découpée en phrases et placée sur la vidéo par `voix/build_voice.py` ; la phrase « Trois leviers… » est accélérée de 6 % pour tenir dans la scène. La bouche suit le volume réel de cette voix et la musique baisse pendant qu'elle parle (`voix/mix.py`).

**Voix du fondateur : à enregistrer.** Les lignes « Fondateur » ci-dessus tombent dans les silences laissés par la mascotte ; garde les minutages à ±0,3 s.

Textes d'un seul bloc (pour un outil de synthèse vocale) :

> **Mascotte** : Vivo Partner, c'est quoi ? … Trois leviers : la visibilité, notre réceptionniste IA, et Aplomb, notre outil métier sur mesure. … Et surtout : pas une solution toute faite, la même pour tous. … On commence par comprendre votre entreprise, avec un audit. Puis on construit ce dont vous avez réellement besoin. … Vivo Partner. Réservez votre diagnostic gratuit.

> **Fondateur** : Un partenaire de croissance digitale pour toutes les entreprises du BTP, basé à Carcassonne. … Notre objectif : développer votre activité, gagner du temps, et ne plus laisser passer d'opportunités. … On s'adapte à vous, à votre entreprise, à vos process. Et pas l'inverse. … Plus de clients. Plus de temps. Zéro opportunité perdue.
