import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { springAt, tween, useLayout, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { Icon } from '../components/Icon';
import { Phone, PHONE_H, PHONE_W } from '../components/Phone';
import { WordReveal } from '../components/WordReveal';
import { DarkBackground, Fit } from '../components/ui';

/* Scène 1 — HOOK : un téléphone vibre, l'appel n'est pas décroché,
   les notifications « Appel manqué » se multiplient. */

export const CALL_END = 78; // l'appel bascule en « manqué »
/** Images d'apparition des notifications : de plus en plus rapprochées */
export const MISSED_AT = [86, 104, 118, 129, 138, 145, 151, 156];
const NUMBERS = [
  '06 •• •• •• 47',
  '07 •• •• •• 12',
  '06 •• •• •• 85',
  '06 •• •• •• 03',
  '07 •• •• •• 61',
  '06 •• •• •• 29',
  '06 •• •• •• 74',
  '07 •• •• •• 38',
];

/** Salves de vibration [début, fin] en images */
export const VIBRATE: [number, number][] = [
  [8, 30],
  [40, 62],
];
const vibrating = (f: number) => VIBRATE.some(([a, b]) => f > a && f < b);

const IncomingCall: React.FC<{ frame: number }> = ({ frame }) => {
  const out = tween(frame, [CALL_END - 6, CALL_END + 6], [1, 0]);
  const ring = (offset: number) => {
    const t = ((frame + offset) % 36) / 36;
    return { opacity: (1 - t) * 0.5, transform: `scale(${1 + t * 0.9})` };
  };
  return (
    <AbsoluteFill
      style={{
        opacity: out,
        background: 'linear-gradient(180deg, #1C2B4A 0%, #0D1527 100%)',
        alignItems: 'center',
        paddingTop: 150,
        fontFamily: FONTS.body,
        color: COLORS.white,
      }}
    >
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {[0, 12, 24].map((o) => (
          <div
            key={o}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 999,
              border: `2px solid ${COLORS.orange}`,
              ...ring(o),
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="phone" size={52} color={COLORS.white} strokeWidth={1.6} />
        </div>
      </div>
      <div style={{ marginTop: 44, fontSize: 18, opacity: 0.6, letterSpacing: '0.04em' }}>Appel entrant…</div>
      <div style={{ marginTop: 10, fontFamily: FONTS.heading, fontWeight: 700, fontSize: 36 }}>
        {TEXTS.hook.incomingCaller}
      </div>
      <div style={{ marginTop: 8, fontSize: 20, opacity: 0.7 }}>{TEXTS.hook.incomingNumber}</div>

      <div
        style={{ position: 'absolute', bottom: 90, left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 99,
            background: COLORS.danger,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(135deg)',
          }}
        >
          <Icon name="phone" size={36} color="white" />
        </div>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 99,
            background: COLORS.success,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${1 + Math.sin(frame / 4) * 0.05})`,
          }}
        >
          <Icon name="phone" size={36} color="white" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LockScreen: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const visible = tween(frame, [CALL_END - 2, CALL_END + 10], [0, 1]);
  const shown = MISSED_AT.filter((t) => frame >= t - 1).length;
  return (
    <AbsoluteFill
      style={{
        opacity: visible,
        background: 'radial-gradient(120% 80% at 50% 0%, #1A2E57 0%, #0B1222 70%)',
        fontFamily: FONTS.body,
        color: COLORS.white,
        alignItems: 'center',
        paddingTop: 92,
      }}
    >
      <div style={{ fontSize: 18, opacity: 0.7 }}>mardi 14 octobre</div>
      <div
        style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 84, letterSpacing: '-0.03em', lineHeight: 1 }}
      >
        10:42
      </div>

      <div style={{ position: 'absolute', top: 250, left: 16, right: 16 }}>
        {MISSED_AT.map((at, i) => {
          const p = springAt(frame, fps, at, SPRINGS.snappy);
          if (p <= 0.001) return null;
          // les plus récentes en haut : chaque nouvelle carte pousse les autres vers le bas
          const newer = MISSED_AT.filter((t, j) => j > i && frame >= t).length;
          const newerProgress = MISSED_AT.slice(i + 1).reduce(
            (acc, t) => acc + springAt(frame, fps, t, SPRINGS.snappy),
            0,
          );
          const y = newerProgress * 82;
          const depthFade = newer > 4 ? tween(newer, [4, 6], [1, 0]) : 1;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                transform: `translateY(${y + (1 - p) * -40}px) scale(${0.9 + p * 0.1})`,
                opacity: p * depthFade,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 22,
                background: 'rgba(255,255,255,0.14)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: COLORS.danger,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="phoneMissed" size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{TEXTS.hook.missedCall}</div>
                <div style={{ fontSize: 15, opacity: 0.65, marginTop: 2 }}>{NUMBERS[i]}</div>
              </div>
              <div style={{ fontSize: 13, opacity: 0.5, alignSelf: 'flex-start' }}>maintenant</div>
            </div>
          );
        })}
      </div>

      {shown > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 16,
            opacity: 0.55,
          }}
        >
          {shown} {shown > 1 ? 'appels manqués' : 'appel manqué'}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const S1Hook: React.FC = () => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const { vertical, width, height, pad } = useLayout();

  const enter = springAt(frame, fps, 0, SPRINGS.soft, 30);
  const shakeX = vibrating(frame) ? Math.sin(frame * 2.6) * 7 : 0;
  const shakeR = vibrating(frame) ? Math.sin(frame * 3.1) * 1.6 : 0;
  // Lente poussée caméra sur toute la scène
  const push = tween(frame, [0, 180], [1, 1.06]);
  // Halo rouge discret quand les appels manqués s'accumulent
  const alarm = tween(frame, [MISSED_AT[0], MISSED_AT[MISSED_AT.length - 1]], [0, 1]);

  const phoneBox = vertical ? { w: width - pad * 2, h: height * 0.55 } : { w: width * 0.4, h: height - 160 };
  const fontSize = vertical ? 82 : 78;

  const phone = (
    <Fit designWidth={PHONE_W + 40} designHeight={PHONE_H + 40} maxWidth={phoneBox.w} maxHeight={phoneBox.h}>
      <div
        style={{
          padding: 20,
          transform: `translate(${shakeX}px, ${(1 - enter) * 80}px) rotate(${shakeR - 4 + enter * 4}deg) scale(${push})`,
          opacity: enter,
        }}
      >
        <Phone>
          <LockScreen frame={frame} fps={fps} />
          <IncomingCall frame={frame} />
        </Phone>
        {/* lignes de vibration */}
        {vibrating(frame) &&
          [-1, 1].map((side) => (
            <div
              key={side}
              style={{
                position: 'absolute',
                top: '42%',
                [side < 0 ? 'left' : 'right']: -26,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {[0, 1].map((k) => (
                <div
                  key={k}
                  style={{
                    width: 4,
                    height: 34 + k * 18,
                    borderRadius: 4,
                    background: COLORS.orange,
                    opacity: 0.4 + 0.4 * Math.abs(Math.sin(frame / 2 + k)),
                  }}
                />
              ))}
            </div>
          ))}
      </div>
    </Fit>
  );

  const text = (
    <div style={{ position: 'relative', width: vertical ? '100%' : width * 0.44, minHeight: fontSize * 2.4 }}>
      <WordReveal
        text={TEXTS.hook.line1}
        start={10}
        exit={92}
        fontSize={fontSize}
        color={COLORS.white}
        align={vertical ? 'center' : 'left'}
        style={{ position: 'absolute', inset: 0 }}
      />
      <WordReveal
        text={TEXTS.hook.line2}
        start={100}
        fontSize={fontSize}
        color={COLORS.white}
        align={vertical ? 'center' : 'left'}
        style={{ position: 'absolute', inset: 0 }}
      />
    </div>
  );

  return (
    <DarkBackground>
      <AbsoluteFill
        style={{
          background: `radial-gradient(50% 45% at ${vertical ? '50% 38%' : '70% 50%'}, rgba(229,72,77,${0.22 * alarm}), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          flexDirection: vertical ? 'column-reverse' : 'row',
          alignItems: 'center',
          justifyContent: vertical ? 'center' : 'space-between',
          gap: vertical ? 80 : 40,
          padding: pad,
        }}
      >
        {text}
        {phone}
      </AbsoluteFill>
    </DarkBackground>
  );
};
