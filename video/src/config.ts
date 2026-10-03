/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  VivoPartner — Trailer 32 s : TOUTES les constantes modifiables sont ici.
 *  Couleurs, polices, durées des scènes, textes à l'écran, pistes audio.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Vidéo ─────────────────────────────────────────────────────────────────── */
export const FPS = 30;

export const FORMATS = {
  landscape: { id: '16x9', width: 1920, height: 1080 },
  vertical: { id: '9x16', width: 1080, height: 1920 },
} as const;

/** Durée du fondu enchaîné entre deux scènes (en images). La scène suivante
 *  démarre pile à son timecode et se fond par-dessus la précédente. */
export const CROSSFADE_FRAMES = 8;

/* ── Couleurs ──────────────────────────────────────────────────────────────── */
export const COLORS = {
  navy: '#0B2F6B',
  navyDeep: '#071E46', // navy assombri, pour les fonds sombres
  orange: '#F58220',
  white: '#F8FAFC',
  pureWhite: '#FFFFFF',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate500: '#64748B',
  ink: '#0F172A',
  /* Couleurs fonctionnelles (états d'interface) */
  success: '#16A34A',
  danger: '#E5484D',
} as const;

/* ── Polices ───────────────────────────────────────────────────────────────── */
export const FONTS = {
  heading: "'Satoshi', 'Inter', sans-serif",
  body: "'Inter', -apple-system, 'Helvetica Neue', sans-serif",
} as const;

/* ── Mouvement ─────────────────────────────────────────────────────────────── */
export const SPRINGS = {
  /** Doux, sans rebond : apparitions de textes et cartes */
  soft: { damping: 200, mass: 1, stiffness: 100 },
  /** Vif, léger dépassement : éléments d'interface */
  snappy: { damping: 18, mass: 0.8, stiffness: 170 },
  /** Rebond marqué : pin Google Maps, mots qui « claquent » */
  bouncy: { damping: 11, mass: 0.9, stiffness: 140 },
} as const;

/** Délai (images) entre deux mots dans les textes qui apparaissent mot par mot */
export const WORD_STAGGER = 4;

/* ── Découpage des scènes (secondes) ───────────────────────────────────────────
 *  Calé sur la voix off (voir VOIX-OFF.md). Modifier une durée décale
 *  automatiquement toutes les scènes suivantes.                                */
export const SCENE_SECONDS = {
  hook: 3.5, //            0 → 3,5 s
  probleme: 5, //        3,5 → 8,5 s
  bascule: 3.2, //       8,5 → 11,7 s
  aplomb: 4.5, //       11,7 → 16,2 s
  receptionniste: 4.5, // 16,2 → 20,7 s
  visibilite: 4.6, //   20,7 → 25,3 s
  benefices: 3.1, //    25,3 → 28,4 s
  cta: 3.7, //          28,4 → 32,1 s
} as const;

/** Vitesse des animations à l'intérieur des scènes (1 = rythme d'origine, 1,6 = 60 % plus rapide).
 *  Les timings écrits dans les scènes (constantes T, BEAT…) sont en « images d'animation » :
 *  ils sont divisés par SPEED à l'écran, et les bruitages suivent. */
export const SPEED = 1.6;

export type SceneKey = keyof typeof SCENE_SECONDS;

export const sec = (s: number) => Math.round(s * FPS);

export const SCENE_ORDER: SceneKey[] = [
  'hook',
  'probleme',
  'bascule',
  'aplomb',
  'receptionniste',
  'visibilite',
  'benefices',
  'cta',
];

/** Début (en images) et durée de chaque scène, calculés à partir de SCENE_SECONDS */
export const TIMELINE = SCENE_ORDER.reduce(
  (acc, key) => {
    const from = acc.cursor;
    const duration = sec(SCENE_SECONDS[key]);
    acc.items.push({ key, from, duration });
    acc.cursor += duration;
    return acc;
  },
  { cursor: 0, items: [] as { key: SceneKey; from: number; duration: number }[] },
);

export const TOTAL_FRAMES = TIMELINE.cursor;

/* ── Textes à l'écran ──────────────────────────────────────────────────────────
 *  Un mot entouré de *astérisques* s'affiche en orange.                        */
export const TEXTS = {
  hook: {
    line1: 'Pendant que vous êtes sur le chantier…',
    line2: '…vos clients *appellent* *ailleurs.*',
    incomingCaller: 'Nouveau client',
    incomingNumber: '06 •• •• •• 47',
    missedCall: 'Appel manqué',
  },
  probleme: {
    beats: ['Devis en retard.', 'Relances oubliées.', '*Soirées* *perdues* dans l’admin.'],
    quoteLabel: 'DEVIS',
    lateTag: 'En retard',
    inboxTitle: 'Boîte de réception',
    inboxRows: [
      'Relance — devis salle de bain',
      'Re : demande de devis toiture',
      'Facture à envoyer',
      'Rappel : chantier jeudi',
      'Re : Re : devis cuisine',
      'Demande d’intervention',
      'Relance — acompte',
      'Question sur le devis',
    ],
  },
  bascule: {
    question: 'Et si votre entreprise tournait *toute* *seule* ?',
  },
  aplomb: {
    eyebrow: 'Pilier 1',
    title: 'Aplomb.',
    subtitle: 'Toute votre gestion, *automatisée.*',
  },
  receptionniste: {
    eyebrow: 'Pilier 2',
    lines: ['Un réceptionniste IA.', '*24h/24.*', 'Aucun appel perdu.'],
    transcript: [
      { who: 'client', text: 'Bonjour, j’ai une fuite sous l’évier. Vous pouvez passer ?' },
      { who: 'ia', text: 'Bien sûr. Je vous propose jeudi à 9 h, ça vous convient ?' },
      { who: 'client', text: 'Parfait, merci !' },
    ],
    eventTitle: 'Intervention — fuite évier',
    eventTime: 'Jeu. 9:00',
    toast: 'RDV confirmé · SMS envoyé au client',
  },
  visibilite: {
    eyebrow: 'Pilier 3',
    lines: ['Site, référencement, publicité.', 'On vous rend *visible.*'],
    businessName: 'Votre entreprise',
    businessTrade: 'Plomberie · Chauffage',
    siteHero: 'Votre artisan de confiance',
    siteCta: 'Demander un devis',
    chartLabel: 'Visites du site',
  },
  benefices: {
    words: ['Plus de devis.', 'Plus de temps.', '*Zéro* *client* *perdu.*'],
  },
  cta: {
    taglineNavy: 'Automatise aujourd’hui.',
    taglineOrange: 'Accélère demain.',
    url: 'vivopartner.com',
    button: 'Prendre rendez-vous',
  },
} as const;

/* ── Audio ─────────────────────────────────────────────────────────────────────
 *  Fichiers dans video/public/audio/ (régénérables, voir README) :
 *  - music.mp3          musique synthétisée, calée sur les scènes
 *  - vo/vo-XX.mp3       voix off phrase par phrase (texte et placement : src/audio/voiceover.json)
 *  - sfx/*.mp3          bruitages (placement : src/audio/sfx.ts)
 *  Mettre un élément à `null` / `false` pour le couper.                         */
export const AUDIO = {
  music: 'audio/music.mp3' as string | null,
  voiceover: true,
  sfx: true,
  musicVolume: 0.5, // musique seule (0 → 1)
  /** Musique abaissée à ce niveau (fraction de musicVolume) pendant la voix off */
  musicDuck: 0.4,
  voiceoverVolume: 1,
  sfxVolume: 0.55,
  musicFadeInSeconds: 0.5,
  musicFadeOutSeconds: 1.5,
} as const;
