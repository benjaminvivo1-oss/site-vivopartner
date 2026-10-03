import React from 'react';
import { useVideoConfig } from 'remotion';
import { EASE_OUT, springAt, tween, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS } from '../config';
import { shadow } from './ui';

export type ProofData = {
  kicker: string;
  before: string;
  value: number;
  format: (n: number) => string;
  after: string;
  source: string;
};

/**
 * Preuve chiffrée : gros chiffre orange qui compte (count-up rapide), phrase, source en petit gris.
 * `at` = image d'animation d'apparition (comme les constantes T des scènes).
 */
export const ProofCard: React.FC<{
  proof: ProofData;
  at: number;
  width: number;
  /** Taille du chiffre en px */
  size?: number;
  style?: React.CSSProperties;
}> = ({ proof, at, width, size = 104, style }) => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const p = springAt(frame, fps, at, SPRINGS.snappy);
  const count = tween(frame, [at + 4, at + 34], [0, 1], EASE_OUT);
  const txt = size * 0.3;
  return (
    <div
      style={{
        width,
        boxSizing: 'border-box',
        padding: `${size * 0.28}px ${size * 0.34}px ${size * 0.24}px`,
        borderRadius: size * 0.28,
        background: COLORS.pureWhite,
        boxShadow: shadow.lg,
        border: `1px solid ${COLORS.slate200}`,
        fontFamily: FONTS.body,
        color: COLORS.ink,
        opacity: Math.min(1, p * 1.4),
        transform: `translateY(${(1 - p) * 60}px) scale(${0.94 + 0.06 * p})`,
        ...style,
      }}
    >
      {proof.kicker && (
        <div
          style={{
            display: 'inline-block',
            marginBottom: size * 0.12,
            padding: `${txt * 0.25}px ${txt * 0.6}px`,
            borderRadius: 999,
            background: COLORS.navy,
            color: COLORS.white,
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: txt * 0.95,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {proof.kicker}
        </div>
      )}
      {proof.before && <div style={{ fontSize: txt, fontWeight: 600, lineHeight: 1.25 }}>{proof.before} =</div>}
      <div
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          color: COLORS.orange,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {proof.format(proof.value * count)}
      </div>
      {proof.after && (
        <div style={{ fontSize: txt, fontWeight: 600, lineHeight: 1.25, marginTop: size * 0.04 }}>{proof.after}</div>
      )}
      <div style={{ fontSize: txt * 0.62, color: COLORS.slate500, marginTop: size * 0.14, lineHeight: 1.3 }}>
        {proof.source}
      </div>
    </div>
  );
};
