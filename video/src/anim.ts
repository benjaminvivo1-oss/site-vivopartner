import { Easing, interpolate, spring, useVideoConfig } from 'remotion';
import { SPRINGS } from './config';

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** interpolate() borné avec easing doux par défaut */
export const tween = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = EASE_OUT,
) => interpolate(frame, input, output, { ...clamp, easing });

/** Ressort 0 → 1 démarrant à `delay` */
export const springAt = (
  frame: number,
  fps: number,
  delay = 0,
  config: { damping: number; mass: number; stiffness: number } = SPRINGS.soft,
  durationInFrames?: number,
) => spring({ frame: frame - delay, fps, config, durationInFrames });

/** Infos de mise en page selon le format (16:9 ou 9:16) */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return {
    width,
    height,
    vertical,
    /** Marge extérieure */
    pad: vertical ? 84 : 120,
  };
};

/** Découpe « texte avec *mots* en orange » en mots + indicateur d'accent */
export const parseAccent = (text: string) =>
  text
    .split(' ')
    .filter(Boolean)
    .map((raw) => {
      const accent = /^\*.*\*[.,!?…]?$/.test(raw);
      const word = raw.replace(/\*/g, '');
      return { word, accent };
    });
