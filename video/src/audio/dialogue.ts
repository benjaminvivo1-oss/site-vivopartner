import { sec, SPEED, TIMELINE, type Timeline } from '../config';
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

/** Répliques d'un montage avec leur image de départ absolue et leur durée (images réelles) */
export const dialogueAbs = (tl: Timeline) => {
  const scene = tl.items.find((s) => s.key === 'receptionniste');
  if (!scene) return [];
  return DIALOGUE.map((l) => ({
    ...l,
    from: scene.from + sec(l.at),
    frames: Math.ceil(l.duration * 30) + 2,
  }));
};

export const DIALOGUE_ABS = dialogueAbs(TIMELINE);
