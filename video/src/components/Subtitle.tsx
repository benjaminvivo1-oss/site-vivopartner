import React from 'react';
import { useCurrentFrame } from 'remotion';
import { tween } from '../anim';
import { COLORS, FONTS } from '../config';
import type { DialogueLine } from '../audio/dialogue';

/**
 * Sous-titres incrustés du dialogue (lisibles sans le son) : le mot prononcé s'allume au fil de la
 * réplique (répartition au prorata des lettres). Images réelles, locales à la scène.
 */
export const Subtitle: React.FC<{ lines: DialogueLine[]; fontSize: number; style?: React.CSSProperties }> = ({
  lines,
  fontSize,
  style,
}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const line = lines.find((l) => t >= l.at - 0.1 && t <= l.at + l.duration + 0.35);
  if (!line) return null;
  const isIa = line.id === 'ia';
  const fade = Math.min(
    tween(t, [line.at - 0.1, line.at + 0.05], [0, 1]),
    tween(t, [line.at + line.duration + 0.15, line.at + line.duration + 0.35], [1, 0]),
  );
  const words = line.text.split(' ');
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  let acc = 0;
  const progress = (t - line.at) / line.duration;
  return (
    <div
      style={{
        maxWidth: fontSize * 19,
        padding: `${fontSize * 0.35}px ${fontSize * 0.55}px`,
        borderRadius: fontSize * 0.45,
        background: 'rgba(7,30,70,0.97)',
        border: `1px solid rgba(255,255,255,0.12)`,
        boxShadow: '0 20px 50px -20px rgba(0,0,0,0.6)',
        opacity: fade,
        transform: `translateY(${(1 - fade) * 16}px)`,
        textAlign: 'center',
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.body,
          fontWeight: 700,
          fontSize: fontSize * 0.5,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: isIa ? COLORS.orange : COLORS.slate200,
          marginBottom: fontSize * 0.15,
        }}
      >
        {line.speaker}
      </div>
      <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize, lineHeight: 1.22, color: COLORS.white }}>
        {words.map((w, i) => {
          const start = acc / total;
          acc += w.length + 1;
          const lit = progress >= start - 0.02;
          return (
            <span key={i} style={{ opacity: lit ? 1 : 0.38 }}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};
