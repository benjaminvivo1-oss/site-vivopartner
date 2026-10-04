import { sec, TIMELINE, type SceneKey, type Timeline } from '../config';
import data from './voiceover.json';

export type VoLine = { id: string; text: string; from: number; duration: number };

/** Parties de voix off d'un montage, avec leur image de départ absolue et leur durée (en images).
 *  Les parties dont la scène n'est pas dans le montage sont ignorées. */
export const voLines = (tl: Timeline): VoLine[] =>
  data.takes.flatMap((take) =>
    take.parts.flatMap((p) => {
      const s = tl.items.find((i) => i.key === (p.scene as SceneKey));
      if (!s) return [];
      return [
        {
          id: p.id,
          text: p.text,
          from: s.from + sec(p.at),
          duration: Math.ceil(((p as { duration?: number }).duration ?? 2) * 30) + 2,
        },
      ];
    }),
  );

export const VO_LINES = voLines(TIMELINE);
