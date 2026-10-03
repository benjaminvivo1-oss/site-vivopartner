import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { springAt, tween, useLayout, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { Icon } from '../components/Icon';
import { WordReveal } from '../components/WordReveal';
import { Card, Chip, Eyebrow, Fit, NavyBackground, Pop, Skeleton, shadow } from '../components/ui';

/* Scène 5 — PILIER 2 : AGENT RÉCEPTIONNISTE IA.
   Onde vocale, transcription en direct, puis un RDV ajouté à l'agenda. */

const SW = 1180;
const SH = 760;
/* Version portrait (9:16) : cartes empilées */
const SW_V = 760;
const SH_V = 1120;

export const T = {
  call: 8,
  bubbles: [26, 78, 128],
  calendar: 150,
  event: 176,
  toast: 200,
};

/** Qui parle à l'image f (pour colorer l'onde) */
const speaker = (f: number) => {
  const [a, b, c] = T.bubbles;
  if (f >= c) return 'client';
  if (f >= b) return 'ia';
  if (f >= a) return 'client';
  return 'none';
};

const Waveform: React.FC<{ frame: number }> = ({ frame }) => {
  const who = speaker(frame);
  const active = who !== 'none' && frame < T.calendar;
  const N = 46;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 96 }}>
      {Array.from({ length: N }).map((_, i) => {
        const env = Math.sin((i / (N - 1)) * Math.PI); // enveloppe en cloche
        const n =
          0.5 +
          0.5 * Math.sin(frame * 0.45 + i * 0.9) * Math.cos(frame * 0.21 + i * 0.37) +
          0.25 * Math.sin(frame * 0.8 + i * 2.3);
        const h = active ? 10 + env * Math.max(0.1, n) * 84 : 6 + env * 4;
        return (
          <div
            key={i}
            style={{
              width: 6,
              height: h,
              borderRadius: 6,
              background: who === 'ia' ? COLORS.orange : COLORS.navy,
              opacity: 0.35 + env * 0.65,
            }}
          />
        );
      })}
    </div>
  );
};

const Typewriter: React.FC<{ text: string; frame: number; start: number; cps?: number }> = ({
  text,
  frame,
  start,
  cps = 2.2,
}) => {
  const n = Math.max(0, Math.floor((frame - start) * cps));
  return (
    <>
      {text.slice(0, n)}
      <span style={{ opacity: 0 }}>{text.slice(n)}</span>
    </>
  );
};

const CallCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const seconds = Math.max(0, Math.floor((frame - T.call) / 30));
  const livePulse = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <Card style={{ width: 600, padding: 30, borderRadius: 28, boxShadow: shadow.lg, border: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 16,
            background: COLORS.orange,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="bot" size={30} color={COLORS.white} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 24 }}>Réceptionniste IA</div>
          <div style={{ fontSize: 15, color: COLORS.slate500, marginTop: 2 }}>
            Appel en cours · 00:{String(seconds).padStart(2, '0')}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 99,
            background: 'rgba(22,163,74,0.1)',
            color: COLORS.success,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <span
            style={{ width: 9, height: 9, borderRadius: 9, background: COLORS.success, opacity: 0.4 + 0.6 * livePulse }}
          />
          En direct
        </div>
      </div>

      <div style={{ margin: '22px 0', display: 'flex', justifyContent: 'center' }}>
        <Waveform frame={frame} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 300 }}>
        {TEXTS.receptionniste.transcript.map((m, i) => {
          const at = T.bubbles[i];
          const p = springAt(frame, fps, at, SPRINGS.snappy);
          const ia = m.who === 'ia';
          return (
            <div
              key={i}
              style={{
                alignSelf: ia ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                opacity: p,
                transform: `translateY(${(1 - p) * 20}px) scale(${0.95 + 0.05 * p})`,
                transformOrigin: ia ? 'right bottom' : 'left bottom',
              }}
            >
              <div style={{ fontSize: 13, color: COLORS.slate500, marginBottom: 6, textAlign: ia ? 'right' : 'left' }}>
                {ia ? 'Assistant IA' : 'Client'}
              </div>
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 18,
                  borderBottomLeftRadius: ia ? 18 : 6,
                  borderBottomRightRadius: ia ? 6 : 18,
                  background: ia ? COLORS.navy : COLORS.slate100,
                  color: ia ? COLORS.white : COLORS.ink,
                  fontSize: 19,
                  lineHeight: 1.4,
                }}
              >
                <Typewriter text={m.text} frame={frame} start={at + 4} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
const HOURS = ['8:00', '9:00', '10:00', '11:00', '12:00'];
/** Créneaux déjà occupés : [jour, heure de début (index), durée] */
const BUSY: [number, number, number][] = [
  [0, 0, 2],
  [1, 2, 2],
  [2, 0, 1],
  [3, 3, 2],
  [4, 1, 2],
];

const CalendarCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ev = springAt(frame, fps, T.event, SPRINGS.bouncy);
  const ROW = 62;
  const COL = 82;
  return (
    <Card style={{ width: 520, padding: 26, borderRadius: 28, boxShadow: shadow.lg, border: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Icon name="calendar" size={24} color={COLORS.navy} />
        <div style={{ fontWeight: 600, fontSize: 20, flex: 1 }}>Agenda</div>
        <Chip label="Cette semaine" color={COLORS.slate500} bg={COLORS.slate100} size={13} />
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 54, paddingTop: 30 }}>
          {HOURS.map((h) => (
            <div key={h} style={{ height: ROW, fontSize: 12, color: COLORS.slate500 }}>
              {h}
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ display: 'flex', height: 30 }}>
            {DAYS.map((d, i) => (
              <div
                key={d}
                style={{
                  width: COL,
                  fontSize: 13,
                  fontWeight: 600,
                  color: i === 3 ? COLORS.orange : COLORS.slate500,
                  textAlign: 'center',
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div style={{ position: 'relative', height: ROW * HOURS.length }}>
            {HOURS.map((h, i) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: i * ROW,
                  height: 1,
                  background: COLORS.slate100,
                }}
              />
            ))}
            {BUSY.map(([d, s, len], i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: d * COL + 4,
                  top: s * ROW + 4,
                  width: COL - 8,
                  height: len * ROW - 8,
                  borderRadius: 10,
                  background: 'rgba(11,47,107,0.08)',
                  borderLeft: `3px solid rgba(11,47,107,0.35)`,
                  padding: 8,
                  boxSizing: 'border-box',
                }}
              >
                <Skeleton w="80%" h={6} color="rgba(11,47,107,0.18)" />
              </div>
            ))}
            {/* le nouveau RDV */}
            <div
              style={{
                position: 'absolute',
                left: 3 * COL + 2,
                top: 1 * ROW + 2,
                width: COL * 1.9,
                height: ROW * 2 - 4,
                borderRadius: 12,
                background: COLORS.orange,
                boxShadow: '0 14px 30px -10px rgba(245,130,32,0.7)',
                padding: '10px 12px',
                boxSizing: 'border-box',
                color: COLORS.white,
                opacity: Math.min(1, ev * 1.3),
                transform: `translateY(${(1 - ev) * -60}px) scale(${0.85 + 0.15 * ev})`,
                transformOrigin: 'left top',
                zIndex: 2,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{TEXTS.receptionniste.eventTitle}</div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{TEXTS.receptionniste.eventTime}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Stage: React.FC<{ frame: number; fps: number; vertical: boolean }> = ({ frame, fps, vertical }) => {
  const toast = springAt(frame, fps, T.toast, SPRINGS.snappy);
  const badge = springAt(frame, fps, 40, SPRINGS.bouncy);
  return (
    <div style={{ width: vertical ? SW_V : SW, height: vertical ? SH_V : SH, position: 'relative' }}>
      <Pop at={T.call} distance={60} style={{ position: 'absolute', left: 0, top: 0 }}>
        <CallCard frame={frame} fps={fps} />
      </Pop>
      <Pop
        at={T.calendar}
        from="right"
        distance={80}
        style={{ position: 'absolute', right: 0, top: vertical ? 500 : 150 }}
      >
        <CalendarCard frame={frame} fps={fps} />
      </Pop>
      {/* badge 24h/24 */}
      <div
        style={{
          position: 'absolute',
          right: vertical ? 0 : 60,
          top: vertical ? 1046 : 30,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 22px',
          borderRadius: 99,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: COLORS.white,
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 26,
          opacity: badge,
          transform: `scale(${0.6 + 0.4 * badge}) translateY(${Math.sin(frame / 18) * 4}px)`,
        }}
      >
        <Icon name="moon" size={24} color={COLORS.orange} /> 24h/24 · 7j/7
      </div>
      {/* notification de confirmation */}
      <div
        style={{
          position: 'absolute',
          right: vertical ? 'auto' : 40,
          left: vertical ? 0 : 'auto',
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 22px',
          borderRadius: 18,
          background: COLORS.ink,
          color: COLORS.white,
          fontFamily: FONTS.body,
          fontWeight: 600,
          fontSize: 19,
          boxShadow: shadow.dark,
          opacity: toast,
          transform: `translateY(${(1 - toast) * 40}px)`,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 99,
            background: COLORS.success,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="check" size={18} color="white" strokeWidth={3} />
        </div>
        {TEXTS.receptionniste.toast}
      </div>
    </div>
  );
};

export const S5Receptionniste: React.FC = () => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const { vertical, width, height, pad } = useLayout();
  const [l1, l2, l3] = TEXTS.receptionniste.lines;
  const fs = vertical ? 76 : 62;

  const text = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: vertical ? 'center' : 'flex-start',
        gap: 22,
        width: vertical ? '100%' : width * 0.33,
        flexShrink: 0,
      }}
    >
      <Eyebrow text={TEXTS.receptionniste.eyebrow} at={4} dark size={vertical ? 26 : 22} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: vertical ? 'center' : 'flex-start', gap: 4 }}>
        <WordReveal text={l1} start={8} fontSize={fs} color={COLORS.white} align={vertical ? 'center' : 'left'} />
        <WordReveal text={l2} start={34} fontSize={fs} color={COLORS.white} />
        <WordReveal text={l3} start={52} fontSize={fs} color={COLORS.white} align={vertical ? 'center' : 'left'} />
      </div>
    </div>
  );

  return (
    <NavyBackground>
      <AbsoluteFill
        style={{
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: vertical ? 70 : 60,
          padding: pad,
        }}
      >
        {text}
        <Fit
          designWidth={vertical ? SW_V : SW}
          designHeight={vertical ? SH_V : SH}
          maxWidth={vertical ? width - pad * 2 + 40 : width * 0.55}
          maxHeight={vertical ? height * 0.6 : height - 200}
        >
          <Stage frame={frame} fps={fps} vertical={vertical} />
        </Fit>
      </AbsoluteFill>
    </NavyBackground>
  );
};
