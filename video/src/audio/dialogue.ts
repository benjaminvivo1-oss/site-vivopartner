import { sec, SPEED, TIMELINE } from '../config';
import data from './dialogue.json';

export type DialogueLine = {
  id: string;
  speaker: string;
  text: string;
  /** Secondes depuis le début de la scène « receptionniste » */
  at: number;
  duration: number;
};

export const DIALOGUE: DialogueLine[] = data.lines.map((l) => ({
  id: l.id,
  speaker: l.speaker,
  text: l.text,
  at: (l as { at?: number }).at ?? 0,
  duration: (l as { duration?: number }).duration ?? 2.5,
}));

export const dialogueSrc = (id: string) => `audio/dialogue/${id}.mp3`;

/** Secondes réelles → images d'animation de la scène (voir SPEED) */
export const animAt = (seconds: number) => seconds * 30 * SPEED;

const sceneStart = TIMELINE.items.find((s) => s.key === 'receptionniste')?.from ?? 0;

/** Répliques avec leur image de départ absolue et leur durée (images réelles) */
export const DIALOGUE_ABS = DIALOGUE.map((l) => ({
  ...l,
  from: sceneStart + sec(l.at),
  frames: Math.ceil(l.duration * 30) + 2,
}));
