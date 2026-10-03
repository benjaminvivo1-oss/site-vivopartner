import { sec, TIMELINE, type SceneKey } from '../config';
import data from './voiceover.json';

export type VoLine = { id: string; text: string; from: number; duration: number };

const sceneStart = (key: SceneKey) => TIMELINE.items.find((s) => s.key === key)?.from ?? 0;

/** Parties de voix off avec leur image de départ absolue et leur durée (en images). */
export const VO_LINES: VoLine[] = data.takes.flatMap((take) =>
  take.parts.map((p) => ({
    id: p.id,
    text: p.text,
    from: sceneStart(p.scene as SceneKey) + sec(p.at),
    duration: Math.ceil(((p as { duration?: number }).duration ?? 2) * 30) + 2,
  })),
);
