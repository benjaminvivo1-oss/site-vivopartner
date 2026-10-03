import React from 'react';
import { AbsoluteFill } from 'remotion';
import { EASE_IN_OUT, tween, useLayout, useSceneFrame } from '../anim';
import { COLORS, TEXTS } from '../config';
import { AnimatedLockup } from '../components/Logo';
import { WordReveal } from '../components/WordReveal';
import { DarkBackground, LightBackground } from '../components/ui';

/* Scène 3 — LA BASCULE : l'écran se nettoie (cercle blanc),
   révélation du logo VP puis du wordmark, et la question. */

/** Ouverture du cercle, monogramme, wordmark, question (images locales) */
export const T3 = { wipe: 0, mark: 10, wordmark: 30, question: 42 };

export const S3Bascule: React.FC = () => {
  const frame = useSceneFrame();
  const { vertical, width, height, pad } = useLayout();

  const diag = Math.hypot(width, height);
  const r = tween(frame, [0, 22], [0, diag / 2 + 40], EASE_IN_OUT);
  const ringOpacity = tween(frame, [14, 30], [1, 0]);
  const settle = tween(frame, [0, 150], [1.04, 1]);

  return (
    <AbsoluteFill>
      <DarkBackground />
      <AbsoluteFill style={{ clipPath: `circle(${r}px at 50% 50%)` }}>
        <LightBackground>
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: vertical ? 120 : 90,
              padding: pad,
              transform: `scale(${settle})`,
            }}
          >
            <AnimatedLockup height={vertical ? 150 : 170} markAt={T3.mark} wordmarkAt={T3.wordmark} />
            <WordReveal
              text={TEXTS.bascule.question}
              start={T3.question}
              fontSize={vertical ? 86 : 80}
              color={COLORS.navy}
              align="center"
              style={{ maxWidth: vertical ? width - pad * 2 : 1400 }}
            />
          </AbsoluteFill>
        </LightBackground>
      </AbsoluteFill>
      {/* liseré orange sur le bord du cercle pendant l'ouverture */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div
          style={{
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: `3px solid ${COLORS.orange}`,
            opacity: ringOpacity,
            flexShrink: 0,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
