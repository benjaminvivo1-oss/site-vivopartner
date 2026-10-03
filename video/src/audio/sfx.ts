/**
 * Bruitages : chaque repère pointe vers un son de public/audio/sfx/ et une image (locale à sa scène).
 * Les timings viennent des constantes exportées par les scènes : si une animation bouge, son bruit suit.
 */
import { SPEED, TIMELINE, type SceneKey } from '../config';
import { CALL_END, MISSED_AT, VIBRATE } from '../scenes/S1Hook';
import { BEAT, CLOCK_RUN, DROPS, ROW_AT, STAMP_AT } from '../scenes/S2Probleme';
import { T3 } from '../scenes/S3Bascule';
import { T as T4 } from '../scenes/S4Aplomb';
import { T as T5 } from '../scenes/S5Receptionniste';
import { T as T6 } from '../scenes/S6Visibilite';
import { BENEFIT_HITS } from '../scenes/S7Benefices';
import { T as T8 } from '../scenes/S8Cta';

export type SfxName =
  | 'vibrate'
  | 'notif'
  | 'paper'
  | 'stamp'
  | 'tick'
  | 'pop'
  | 'click'
  | 'success'
  | 'whoosh'
  | 'shimmer'
  | 'drop'
  | 'impact'
  | 'typing'
  | 'rise';

export type Cue = { sfx: SfxName; frame: number; volume?: number; rate?: number };

const start = (key: SceneKey) => TIMELINE.items.find((s) => s.key === key)?.from ?? 0;

// Repères écrits en images d'animation (comme les scènes) : convertis en images réelles (÷ SPEED).
const scene = (key: SceneKey, cues: Cue[]): Cue[] =>
  cues.map((c) => ({ ...c, frame: Math.round(c.frame / SPEED) + start(key) }));

const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

export const SFX_CUES: Cue[] = [
  ...scene('hook', [
    ...VIBRATE.map(([a]) => ({ sfx: 'vibrate' as const, frame: a, volume: 0.45 })),
    { sfx: 'whoosh', frame: CALL_END - 4, volume: 0.25 },
    ...MISSED_AT.map((f, i) => ({
      sfx: 'notif' as const,
      frame: f,
      volume: 0.55 - i * 0.03,
      rate: 1 + (i % 3) * 0.06,
    })),
  ]),
  ...scene('probleme', [
    ...DROPS.map((d, i) => ({ sfx: 'paper' as const, frame: BEAT[0] + d, volume: 0.7, rate: 0.9 + (i % 4) * 0.07 })),
    { sfx: 'stamp', frame: BEAT[0] + STAMP_AT, volume: 1 },
    ...range(BEAT[1] + CLOCK_RUN[0], BEAT[1] + CLOCK_RUN[1], 6).map((f) => ({
      sfx: 'tick' as const,
      frame: f,
      volume: 0.35,
    })),
    ...ROW_AT.map((r, i) => ({ sfx: 'pop' as const, frame: BEAT[2] + r, volume: 0.5, rate: 0.95 + i * 0.03 })),
  ]),
  ...scene('bascule', [
    { sfx: 'whoosh', frame: T3.wipe, volume: 0.8 },
    { sfx: 'shimmer', frame: T3.mark, volume: 0.6 },
    { sfx: 'whoosh', frame: T3.wordmark, volume: 0.3, rate: 1.3 },
  ]),
  ...scene('aplomb', [
    { sfx: 'whoosh', frame: T4.window, volume: 0.45 },
    ...T4.quotes.flatMap((q) => [
      { sfx: 'pop' as const, frame: q, volume: 0.45 },
      { sfx: 'success' as const, frame: q + T4.quoteSent, volume: 0.35 },
    ]),
    ...T4.relances.map((r, i) => ({ sfx: 'click' as const, frame: r, volume: 0.6, rate: 1 + i * 0.08 })),
    ...range(0, 4, 1).map((i) => ({
      sfx: 'pop' as const,
      frame: T4.reviews + 8 + i * 5,
      volume: 0.35,
      rate: 1.1 + i * 0.07,
    })),
    { sfx: 'rise', frame: T4.chantier, volume: 0.35 },
    { sfx: 'rise', frame: T4.chart, volume: 0.35, rate: 1.2 },
    { sfx: 'pop', frame: T4.proof, volume: 0.5 },
    { sfx: 'rise', frame: T4.proof + 4, volume: 0.3, rate: 1.4 },
  ]),
  ...scene('receptionniste', [
    { sfx: 'whoosh', frame: T5.call, volume: 0.4 },
    { sfx: 'whoosh', frame: T5.calendar, volume: 0.35, rate: 1.2 },
    { sfx: 'paper', frame: T5.event + 4, volume: 0.6 },
    { sfx: 'success', frame: T5.toast, volume: 0.55 },
    { sfx: 'pop', frame: T5.proof, volume: 0.5 },
    { sfx: 'rise', frame: T5.proof + 4, volume: 0.3, rate: 1.4 },
  ]),
  ...scene('visibilite', [
    { sfx: 'drop', frame: T6.pin - 4, volume: 0.8 },
    { sfx: 'whoosh', frame: T6.listing, volume: 0.3, rate: 1.2 },
    ...range(0, 4, 1).map((i) => ({
      sfx: 'pop' as const,
      frame: T6.stars + i * 5,
      volume: 0.35,
      rate: 1.1 + i * 0.07,
    })),
    { sfx: 'whoosh', frame: T6.phone, volume: 0.45 },
    { sfx: 'rise', frame: T6.line[0], volume: 0.4 },
    { sfx: 'pop', frame: T6.proof, volume: 0.5 },
  ]),
  ...scene(
    'benefices',
    BENEFIT_HITS.map((h, i) => ({ sfx: 'impact' as const, frame: h, volume: 0.75 + i * 0.1 })),
  ),
  ...scene('cta', [
    { sfx: 'shimmer', frame: T8.mark, volume: 0.5 },
    { sfx: 'whoosh', frame: T8.wordmark, volume: 0.3, rate: 1.3 },
    { sfx: 'pop', frame: T8.button, volume: 0.6 },
    { sfx: 'success', frame: T8.button + 18, volume: 0.45 },
  ]),
];
