import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { springAt, tween, useLayout } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { Icon } from '../components/Icon';
import { AnimatedLockup } from '../components/Logo';
import { WordReveal } from '../components/WordReveal';
import { LightBackground } from '../components/ui';

/* Scène 8 (54 → 60 s) — CTA : logo, tagline bicolore, URL et bouton animé. */

export const T = { mark: 2, wordmark: 14, taglineNavy: 26, taglineOrange: 44, url: 62, button: 74 };

export const S8Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { vertical, pad } = useLayout();

  const btn = springAt(frame, fps, T.button, SPRINGS.bouncy);
  const url = springAt(frame, fps, T.url, SPRINGS.soft);
  // Reflet qui balaie le bouton
  const shine = (frame - T.button - 18) % 60;
  const shineX = tween(shine, [0, 28], [-40, 140]);
  // Halo qui « respire »
  const glowT = Math.max(0, frame - T.button - 10);
  const ring = (glowT % 45) / 45;

  const tfs = vertical ? 74 : 72;

  return (
    <LightBackground>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: pad,
          gap: vertical ? 70 : 54,
          transform: `scale(${tween(frame, [0, 180], [1.03, 1])})`,
        }}
      >
        <AnimatedLockup height={vertical ? 140 : 150} markAt={T.mark} wordmarkAt={T.wordmark} />

        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            columnGap: tfs * 0.3,
            rowGap: 6,
          }}
        >
          <WordReveal
            text={TEXTS.cta.taglineNavy}
            start={T.taglineNavy}
            fontSize={tfs}
            color={COLORS.navy}
            weight={700}
          />
          <WordReveal
            text={TEXTS.cta.taglineOrange}
            start={T.taglineOrange}
            fontSize={tfs}
            color={COLORS.orange}
            weight={700}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            gap: vertical ? 34 : 40,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.body,
              fontWeight: 600,
              fontSize: vertical ? 40 : 34,
              color: COLORS.ink,
              letterSpacing: '-0.01em',
              opacity: url,
              transform: `translateY(${(1 - url) * 20}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Icon name="globe" size={vertical ? 36 : 30} color={COLORS.navy} />
            {TEXTS.cta.url}
          </div>

          <div style={{ position: 'relative' }}>
            {/* anneau pulsé */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                border: `3px solid ${COLORS.orange}`,
                opacity: frame > T.button + 10 ? (1 - ring) * 0.6 : 0,
                transform: `scale(${1 + ring * 0.18}, ${1 + ring * 0.5})`,
              }}
            />
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: vertical ? '30px 52px' : '26px 46px',
                borderRadius: 999,
                background: COLORS.orange,
                color: COLORS.ink,
                fontFamily: FONTS.body,
                fontWeight: 700,
                fontSize: vertical ? 40 : 34,
                boxShadow: '0 20px 40px -14px rgba(245,130,32,0.65), 0 2px 0 rgba(255,255,255,0.4) inset',
                opacity: Math.min(1, btn * 1.5),
                transform: `scale(${0.6 + 0.4 * btn})`,
              }}
            >
              {TEXTS.cta.button}
              <div style={{ transform: `translateX(${Math.sin(frame / 8) * 4}px)` }}>
                <Icon name="arrowRight" size={vertical ? 38 : 32} color={COLORS.ink} strokeWidth={2.6} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${shineX}%`,
                  width: '30%',
                  background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)',
                  transform: 'skewX(-20deg)',
                  opacity: frame > T.button + 18 ? 1 : 0,
                }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </LightBackground>
  );
};
