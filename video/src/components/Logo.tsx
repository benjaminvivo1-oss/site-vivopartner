import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { springAt } from '../anim';
import { SPRINGS } from '../config';

/* Proportions des fichiers PNG de la marque (public/brand) */
const MARK_RATIO = 344 / 242;
const WORDMARK_RATIO = 912 / 124;

/**
 * Logo animé : le monogramme VP apparaît seul au centre, puis glisse vers la
 * gauche pendant que le wordmark VivoPartner se dévoile.
 */
export const AnimatedLockup: React.FC<{
  /** Hauteur du monogramme en px */
  height: number;
  markAt: number;
  wordmarkAt: number;
  variant?: 'navy' | 'light';
}> = ({ height, markAt, wordmarkAt, variant = 'navy' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markW = height * MARK_RATIO;
  const wordH = height * 0.5;
  const wordW = wordH * WORDMARK_RATIO;
  const gap = height * 0.22;
  const totalW = markW + gap + wordW;

  const m = springAt(frame, fps, markAt, SPRINGS.snappy);
  const mWipe = springAt(frame, fps, markAt, SPRINGS.soft, 24);
  const w = springAt(frame, fps, wordmarkAt, SPRINGS.soft, 30);

  // Décalage horizontal : monogramme centré tant que le wordmark n'est pas là
  const shift = (1 - w) * (totalW / 2 - markW / 2);

  return (
    <div style={{ position: 'relative', width: totalW, height }}>
      <div
        style={{
          position: 'absolute',
          left: shift,
          top: 0,
          width: markW,
          height,
          opacity: Math.min(1, m * 1.5),
          transform: `scale(${0.6 + 0.4 * m})`,
          filter: m < 0.99 ? `blur(${(1 - m) * 14}px)` : undefined,
          clipPath: `inset(${(1 - mWipe) * 100}% 0 0 0)`,
        }}
      >
        <Img src={staticFile(`brand/vp-mark-${variant}.png`)} style={{ width: '100%', height: '100%' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: shift + markW + gap,
          top: (height - wordH) / 2 + height * 0.04,
          width: wordW,
          height: wordH,
          clipPath: `inset(0 ${(1 - w) * 100}% 0 0)`,
          opacity: w,
          transform: `translateX(${(1 - w) * -30}px)`,
        }}
      >
        <Img src={staticFile(`brand/vp-wordmark-${variant}.png`)} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};
