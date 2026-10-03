import { sec, TIMELINE, type SceneKey } from '../config';
import data from './voiceover.json';

export type VoLine = { id: string; text: string; from: number; duration: number };

const sceneStart = (key: SceneKey) => TIMELINE.items.find((s) => s.key === key)?.from ?? 0;

/** Phrases de voix off avec leur image de départ absolue et leur durée (en images). */
export const VO_LINES: VoLine[] = data.lines.map((l) => ({
  id: l.id,
  text: l.text,
  from: sceneStart(l.scene as SceneKey) + sec(l.at),
  duration: Math.ceil(((l as { duration?: number }).duration ?? 2) * 30) + 2,
}));
