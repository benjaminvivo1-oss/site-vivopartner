import React from 'react';
import { useVideoConfig } from 'remotion';
import { parseAccent, springAt, tween, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS, WORD_STAGGER } from '../config';

/**
 * Texte qui apparaît mot par mot (montée + fondu + léger flou).
 * Les mots entourés d'*astérisques* prennent la couleur d'accent.
 */
export const WordReveal: React.FC<{
  text: string;
  /** Image (locale à la scène) à laquelle apparaît le premier mot */
  start: number;
  /** Image à laquelle le texte disparaît (optionnel) */
  exit?: number;
  stagger?: number;
  fontSize: number;
  color?: string;
  accentColor?: string;
  weight?: number;
  font?: string;
  lineHeight?: number;
  letterSpacing?: string;
  align?: React.CSSProperties['textAlign'];
  style?: React.CSSProperties;
}> = ({
  text,
  start,
  exit,
  stagger = WORD_STAGGER,
  fontSize,
  color = COLORS.ink,
  accentColor = COLORS.orange,
  weight = 700,
  font = FONTS.heading,
  lineHeight = 1.08,
  letterSpacing = '-0.025em',
  align = 'left',
  style,
}) => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const words = parseAccent(text);
  const out = exit === undefined ? 0 : tween(frame, [exit, exit + 12], [0, 1]);

  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize,
        lineHeight,
        letterSpacing,
        color,
        textAlign: align,
        opacity: 1 - out,
        transform: `translateY(${-out * 0.25 * fontSize}px)`,
        filter: out > 0 ? `blur(${out * 6}px)` : undefined,
        ...style,
      }}
    >
      {words.map(({ word, accent }, i) => {
        const p = springAt(frame, fps, start + i * stagger, SPRINGS.soft, 22);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              color: accent ? accentColor : undefined,
              opacity: p,
              transform: `translateY(${(1 - p) * 0.45 * fontSize}px)`,
              filter: p < 0.99 ? `blur(${(1 - p) * 10}px)` : undefined,
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
};
