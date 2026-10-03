import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASE_IN_OUT, springAt, tween, useLayout } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { Icon } from '../components/Icon';
import { WordReveal } from '../components/WordReveal';
import { Chip, DarkBackground, Fit, Pop, Skeleton } from '../components/ui';

/* Scène 2 (6 → 16 s) — LE PROBLÈME : devis qui s'empilent, horloge qui file
   jusqu'à 22 h, e-mails non lus qui débordent. */

/** Départ de chaque « temps » (images locales) */
const BEAT = [8, 88, 168];

const PANEL_W = 450;
const PANEL_H = 540;

const panelStyle: React.CSSProperties = {
  width: PANEL_W,
  height: PANEL_H,
  borderRadius: 28,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
  border: '1px solid rgba(255,255,255,0.09)',
  boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6)',
  position: 'relative',
  overflow: 'hidden',
};

/* ── A. Pile de devis ─────────────────────────────────────────────────────── */
const DROPS = [0, 9, 17, 24, 30, 35, 39, 43, 46];

const QuotePile: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const f = frame - BEAT[0];
  const stamp = springAt(f, fps, 56, SPRINGS.bouncy);
  return (
    <div style={panelStyle}>
      {DROPS.map((at, i) => {
        const p = springAt(f, fps, at, SPRINGS.snappy);
        const rot = ((i * 37) % 13) - 6;
        const x = ((i * 53) % 40) - 20;
        const top = i === DROPS.length - 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (PANEL_W - 290) / 2 + x,
              top: 120 - i * 7,
              width: 290,
              height: 360,
              borderRadius: 14,
              background: COLORS.pureWhite,
              boxShadow: '0 10px 30px -8px rgba(0,0,0,0.45)',
              padding: 26,
              transform: `translateY(${(1 - p) * -520}px) rotate(${rot * p + (1 - p) * rot * 3}deg)`,
              opacity: p > 0.001 ? 1 : 0,
              fontFamily: FONTS.body,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontWeight: 900,
                  fontSize: 22,
                  color: COLORS.navy,
                  letterSpacing: '0.06em',
                }}
              >
                {TEXTS.probleme.quoteLabel}
              </div>
              <Icon name="file" size={24} color={COLORS.slate500} />
            </div>
            <div style={{ fontSize: 13, color: COLORS.slate500, marginTop: 6 }}>
              N° {String(41 + i).padStart(4, '0')}
            </div>
            <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton w="90%" />
              <Skeleton w="70%" />
              <Skeleton w="80%" />
              <Skeleton w="55%" />
            </div>
            <div style={{ marginTop: 34, height: 1, background: COLORS.slate200 }} />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton w={70} h={12} color={COLORS.slate100} />
              <Skeleton w={90} h={12} color={COLORS.slate200} />
            </div>
            {top && (
              <div
                style={{
                  position: 'absolute',
                  right: -18,
                  top: 150,
                  transform: `rotate(-12deg) scale(${0.4 + stamp * 0.6})`,
                  opacity: stamp,
                  border: `3px solid ${COLORS.danger}`,
                  color: COLORS.danger,
                  borderRadius: 10,
                  padding: '8px 16px',
                  fontFamily: FONTS.heading,
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  background: 'rgba(255,255,255,0.92)',
                }}
              >
                {TEXTS.probleme.lateTag}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── B. Horloge 17:00 → 22:00 ─────────────────────────────────────────────── */
const ClockPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const f = frame - BEAT[1];
  // minutes écoulées depuis 17:00 (0 → 300)
  const minutes = tween(f, [8, 150], [0, 300], EASE_IN_OUT);
  const total = 17 * 60 + minutes;
  const h = Math.floor(total / 60);
  const m = Math.floor(total % 60);
  const hourAngle = ((total / 60) % 12) * 30;
  const minuteAngle = (total % 60) * 6;
  const night = minutes / 300;
  const R = 150;
  return (
    <div
      style={{
        ...panelStyle,
        background: `linear-gradient(180deg, rgba(245,130,32,${0.16 * (1 - night)}) 0%, rgba(11,47,107,${0.25 + night * 0.25}) 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 34,
      }}
    >
      <div style={{ position: 'absolute', top: 30, right: 32, opacity: night }}>
        <Icon name="moon" size={34} color={COLORS.white} strokeWidth={1.6} />
      </div>
      <svg width={R * 2 + 20} height={R * 2 + 20} viewBox={`${-R - 10} ${-R - 10} ${R * 2 + 20} ${R * 2 + 20}`}>
        <circle r={R} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.22)" strokeWidth={3} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? R - 26 : R - 16;
          return (
            <line
              key={i}
              x1={Math.sin(a) * r1}
              y1={-Math.cos(a) * r1}
              x2={Math.sin(a) * (R - 8)}
              y2={-Math.cos(a) * (R - 8)}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={i % 3 === 0 ? 4 : 2}
              strokeLinecap="round"
            />
          );
        })}
        {/* arc parcouru depuis 17 h */}
        <path
          d={describeArc(R - 40, (17 % 12) * 30, hourAngle)}
          fill="none"
          stroke={COLORS.orange}
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.85}
        />
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-R * 0.48}
          stroke={COLORS.white}
          strokeWidth={8}
          strokeLinecap="round"
          transform={`rotate(${hourAngle})`}
        />
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={-R * 0.72}
          stroke={COLORS.white}
          strokeWidth={4}
          strokeLinecap="round"
          transform={`rotate(${minuteAngle})`}
        />
        <circle r={9} fill={COLORS.orange} />
      </svg>
      <div
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 64,
          color: COLORS.white,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
      </div>
    </div>
  );
};

function describeArc(r: number, startDeg: number, endDeg: number) {
  if (endDeg - startDeg < 0.5) return '';
  const p = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${Math.sin(a) * r} ${-Math.cos(a) * r}`;
  };
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${p(startDeg)} A ${r} ${r} 0 ${large} 1 ${p(endDeg)}`;
}

/* ── C. Boîte de réception qui déborde ────────────────────────────────────── */
const InboxPanel: React.FC<{ frame: number; fps: number; width: number }> = ({ frame, fps, width }) => {
  const f = frame - BEAT[2];
  const rows = TEXTS.probleme.inboxRows;
  const ROW_AT = rows.map((_, i) => 6 + Math.round(i * 9 - i * i * 0.35));
  const arrived = ROW_AT.filter((t) => f >= t).length;
  const pulse = springAt(f, fps, ROW_AT[Math.max(0, arrived - 1)], SPRINGS.bouncy);
  const ROW_H = 74;
  return (
    <div style={{ ...panelStyle, width, background: COLORS.pureWhite, border: 'none' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '26px 28px',
          borderBottom: `1px solid ${COLORS.slate200}`,
          fontFamily: FONTS.body,
        }}
      >
        <Icon name="mail" size={28} color={COLORS.navy} />
        <div style={{ fontWeight: 600, fontSize: 22, color: COLORS.ink, flex: 1 }}>{TEXTS.probleme.inboxTitle}</div>
        <div
          style={{
            minWidth: 40,
            height: 40,
            padding: '0 12px',
            borderRadius: 99,
            background: COLORS.danger,
            color: 'white',
            fontWeight: 700,
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${arrived ? 0.85 + 0.15 * pulse : 0})`,
          }}
        >
          {arrived}
        </div>
      </div>
      <div style={{ position: 'relative', height: PANEL_H - 93, overflow: 'hidden' }}>
        {rows.map((label, i) => {
          const p = springAt(f, fps, ROW_AT[i], SPRINGS.snappy);
          const newer = ROW_AT.slice(i + 1).reduce((acc, t) => acc + springAt(f, fps, t, SPRINGS.snappy), 0);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: newer * ROW_H,
                height: ROW_H,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '0 28px',
                borderBottom: `1px solid ${COLORS.slate100}`,
                background: COLORS.pureWhite,
                opacity: p,
                transform: `translateY(${(1 - p) * -30}px)`,
                fontFamily: FONTS.body,
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: 99, background: COLORS.navy, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    color: COLORS.ink,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                </div>
                <Skeleton w="60%" h={8} style={{ marginTop: 9 }} />
              </div>
              <div style={{ fontSize: 14, color: COLORS.slate500 }}>non lu</div>
            </div>
          );
        })}
        {/* dégradé : la liste « déborde » sous la carte */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 120,
            background: 'linear-gradient(180deg, rgba(255,255,255,0), #fff)',
          }}
        />
      </div>
    </div>
  );
};

export const S2Probleme: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { vertical, width, height, pad } = useLayout();

  // Chaque panneau entre avec son « temps » ; les précédents restent mais s'assombrissent légèrement
  const dim = (i: number) => {
    const next = BEAT[i + 1];
    return next === undefined ? 1 : tween(frame, [next, next + 20], [1, 0.55]);
  };

  const panels = vertical ? (
    <div style={{ width: 940, height: PANEL_H * 2 + 40, display: 'flex', flexWrap: 'wrap', gap: 40 }}>
      <Pop at={BEAT[0] - 4}>
        <div style={{ opacity: dim(0) }}>
          <QuotePile frame={frame} fps={fps} />
        </div>
      </Pop>
      <Pop at={BEAT[1] - 4}>
        <div style={{ opacity: dim(1) }}>
          <ClockPanel frame={frame} />
        </div>
      </Pop>
      <Pop at={BEAT[2] - 4}>
        <InboxPanel frame={frame} fps={fps} width={940} />
      </Pop>
    </div>
  ) : (
    <div style={{ width: PANEL_W * 3 + 80, height: PANEL_H, display: 'flex', gap: 40 }}>
      <Pop at={BEAT[0] - 4}>
        <div style={{ opacity: dim(0) }}>
          <QuotePile frame={frame} fps={fps} />
        </div>
      </Pop>
      <Pop at={BEAT[1] - 4}>
        <div style={{ opacity: dim(1) }}>
          <ClockPanel frame={frame} />
        </div>
      </Pop>
      <Pop at={BEAT[2] - 4}>
        <InboxPanel frame={frame} fps={fps} width={PANEL_W} />
      </Pop>
    </div>
  );

  const fontSize = vertical ? 64 : 64;
  const beats = TEXTS.probleme.beats;
  // Légère dérive caméra
  const drift = tween(frame, [0, 300], [1.0, 1.04]);

  return (
    <DarkBackground glow="rgba(11,47,107,0.45)">
      <AbsoluteFill
        style={{
          flexDirection: vertical ? 'column' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: vertical ? 70 : 64,
          padding: pad,
        }}
      >
        <div style={{ transform: `scale(${drift})` }}>
          {vertical ? (
            <Fit designWidth={940} designHeight={PANEL_H * 2 + 40} maxWidth={width - pad * 2} maxHeight={height * 0.56}>
              {panels}
            </Fit>
          ) : (
            <Fit
              designWidth={PANEL_W * 3 + 80}
              designHeight={PANEL_H}
              maxWidth={width - pad * 2}
              maxHeight={height - 360}
            >
              {panels}
            </Fit>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            columnGap: fontSize * 0.3,
            rowGap: vertical ? 8 : 0,
          }}
        >
          {beats.map((b, i) => (
            <WordReveal key={i} text={b} start={BEAT[i]} fontSize={fontSize} color={COLORS.white} align="center" />
          ))}
        </div>
      </AbsoluteFill>
    </DarkBackground>
  );
};
