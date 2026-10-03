import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { parseAccent, springAt, tween, useLayout, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { Icon } from '../components/Icon';
import { NavyBackground } from '../components/ui';

/* Scène 7 — BÉNÉFICES : trois phrases qui claquent en rythme. */

/** Image d'impact de chaque phrase — à recaler sur la voix off si besoin */
export const BENEFIT_HITS = [6, 40, 74];

export const S7Benefices: React.FC = () => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const { vertical } = useLayout();
  const fs = vertical ? 104 : 116;

  // Flash lumineux à chaque impact
  const flash = Math.max(
    ...BENEFIT_HITS.map((h) => tween(frame, [h, h + 4], [0, 1]) * tween(frame, [h + 4, h + 24], [1, 0])),
  );

  return (
    <NavyBackground>
      <AbsoluteFill
        style={{
          background: `radial-gradient(45% 40% at 50% 50%, rgba(245,130,32,${0.22 * flash}), transparent 75%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: vertical ? 'center' : 'flex-start',
            gap: vertical ? 40 : 26,
          }}
        >
          {TEXTS.benefices.words.map((phrase, i) => {
            const hit = BENEFIT_HITS[i];
            const p = springAt(frame, fps, hit, SPRINGS.bouncy);
            const check = springAt(frame, fps, hit + 6, SPRINGS.bouncy);
            const words = parseAccent(phrase);
            const isAccent = words.every((w) => w.accent);
            return (
              <div
                key={phrase}
                style={{
                  display: 'flex',
                  flexDirection: vertical ? 'column' : 'row',
                  alignItems: 'center',
                  gap: vertical ? 18 : 34,
                  opacity: Math.min(1, p * 2),
                  transform: `scale(${1.5 - 0.5 * p})`,
                  filter: p < 0.98 ? `blur(${(1 - Math.min(1, p)) * 16}px)` : undefined,
                  transformOrigin: vertical ? 'center' : 'left center',
                }}
              >
                <div
                  style={{
                    width: fs * 0.72,
                    height: fs * 0.72,
                    borderRadius: 99,
                    background: isAccent ? COLORS.orange : 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${check})`,
                    flexShrink: 0,
                  }}
                >
                  <Icon name="check" size={fs * 0.42} color={COLORS.white} strokeWidth={3} />
                </div>
                <div
                  style={{
                    fontFamily: FONTS.heading,
                    fontWeight: 900,
                    fontSize: fs,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: isAccent ? COLORS.orange : COLORS.white,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {words.map((w) => w.word).join(' ')}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </NavyBackground>
  );
};
