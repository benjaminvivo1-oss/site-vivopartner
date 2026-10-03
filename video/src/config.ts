/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  VivoPartner — Trailer 60 s : TOUTES les constantes modifiables sont ici.
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
export const CROSSFADE_FRAMES = 12;

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
  hook: 6, //            0 → 6 s
  probleme: 10, //       6 → 16 s
  bascule: 5, //        16 → 21 s
  aplomb: 10, //        21 → 31 s
  receptionniste: 9, // 31 → 40 s
  visibilite: 9, //     40 → 49 s
  benefices: 5, //      49 → 54 s
  cta: 6, //            54 → 60 s
} as const;

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
 *  Déposez vos fichiers dans video/public/audio/ puis renseignez le nom ici
 *  (ex. 'audio/musique.mp3'). Laisser `null` tant que le fichier n'existe pas. */
export const AUDIO = {
  music: null as string | null,
  voiceover: null as string | null,
  musicVolume: 0.35, // volume de la musique sous la voix (0 → 1)
  voiceoverVolume: 1,
  /** Décalage de la voix off en secondes (si votre fichier commence par un blanc) */
  voiceoverOffset: 0,
  musicFadeInSeconds: 1,
  musicFadeOutSeconds: 2,
} as const;
