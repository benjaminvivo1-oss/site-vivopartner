import React from 'react';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { springAt, tween, useLayout, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { animAt, DIALOGUE, dialogueSrc } from '../audio/dialogue';
import { useCut } from '../cut';
import { Icon } from '../components/Icon';
import { ProofCard } from '../components/Proof';
import { Subtitle } from '../components/Subtitle';
import { WordReveal } from '../components/WordReveal';
import { Card, Chip, Eyebrow, Fit, NavyBackground, Pop, Skeleton, shadow } from '../components/ui';

/* Scène 5 — PILIER 2 : AGENT RÉCEPTIONNISTE IA.
   Vrai échange audio client ↔ IA (onde synchronisée sur la voix, sous-titres incrustés),
   puis le RDV s'ajoute à l'agenda et la preuve chiffrée apparaît. */

const SW = 1180;
const SH = 760;
/* Version portrait (9:16) : cartes empilées */
const SW_V = 760;
const SH_V = 960;

const [CLIENT, IA] = DIALOGUE;
const IA_END = IA.at + IA.duration;

/** Timings en images d'animation, déduits du dialogue (src/audio/dialogue.json) */
export const T = {
  call: 6,
  client: animAt(CLIENT.at),
  ia: animAt(IA.at),
  calendar: animAt(IA.at + 0.6),
  event: animAt(IA_END + 0.05),
  toast: animAt(IA_END + 0.5),
  proof: animAt(IA_END + 0.15),
};

/** Qui parle à l'instant t (secondes, temps réel de la scène) */
const speakerAt = (t: number) => DIALOGUE.find((l) => t >= l.at && t <= l.at + l.duration)?.id ?? null;

/** Onde vocale calculée sur le son réel des répliques */
const Waveform: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const client = useAudioData(staticFile(dialogueSrc('client')));
  const ia = useAudioData(staticFile(dialogueSrc('ia')));
  const t = f / fps;
  const who = speakerAt(t);
  const line = DIALOGUE.find((l) => l.id === who);
  const audio = who === 'client' ? client : who === 'ia' ? ia : null;
  const N = 46;
  let bins: number[] = [];
  if (audio && line) {
    bins = visualizeAudio({
      audioData: audio,
      fps,
      frame: Math.round((t - line.at) * fps),
      numberOfSamples: 64,
      optimizeFor: 'speed',
    });
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 110 }}>
      {Array.from({ length: N }).map((_, i) => {
        const fromCenter = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2); // 0 au centre → 1 aux bords
        const env = Math.sin((i / (N - 1)) * Math.PI);
        const v = bins.length ? bins[Math.min(bins.length - 1, Math.floor(fromCenter * 24))] : 0;
        const h = 8 + env * Math.min(1, Math.sqrt(v) * 2.4) * 96;
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

const SpeakerRow: React.FC<{
  icon: 'phone' | 'bot';
  label: string;
  status: string;
  active: boolean;
  accent: string;
}> = ({ icon, label, status, active, accent }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 16px',
      borderRadius: 16,
      background: active ? COLORS.slate100 : 'transparent',
      border: `1px solid ${active ? COLORS.slate200 : 'transparent'}`,
      opacity: active ? 1 : 0.55,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 99,
        background: active ? accent : COLORS.slate200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={20} color={COLORS.white} />
    </div>
    <div style={{ flex: 1, fontWeight: 600, fontSize: 18 }}>{label}</div>
    <div style={{ fontSize: 15, color: active ? accent : COLORS.slate500, fontWeight: 600 }}>
      {active ? status : ''}
    </div>
  </div>
);

const CallCard: React.FC<{ frame: number }> = ({ frame }) => {
  const real = useCurrentFrame() / 30;
  const seconds = Math.max(0, Math.floor(real));
  const livePulse = 0.5 + 0.5 * Math.sin(frame / 5);
  const who = speakerAt(real);
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

      <div style={{ margin: '18px 0 14px', display: 'flex', justifyContent: 'center' }}>
        <Waveform />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SpeakerRow
          icon="phone"
          label="Client"
          status={TEXTS.receptionniste.speakingClient}
          active={who === 'client'}
          accent={COLORS.navy}
        />
        <SpeakerRow
          icon="bot"
          label="Assistant IA"
          status={TEXTS.receptionniste.speakingIa}
          active={who === 'ia'}
          accent={COLORS.orange}
        />
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
      <Pop at={T.call} distance={60} style={{ position: 'absolute', left: 0, top: vertical ? 0 : 60 }}>
        <CallCard frame={frame} />
      </Pop>
      <Pop
        at={T.calendar}
        from="right"
        distance={80}
        style={{ position: 'absolute', right: 0, top: vertical ? 330 : 150 }}
      >
        <CalendarCard frame={frame} fps={fps} />
      </Pop>
      {/* badge 24h/24 */}
      <div
        style={{
          position: 'absolute',
          right: vertical ? 0 : 60,
          top: vertical ? 860 : 30,
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
  const cut = useCut(); // version courte : pas de « Pilier 2 » (les autres piliers n'y sont pas)
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
      {cut === 'full' && <Eyebrow text={TEXTS.receptionniste.eyebrow} at={4} dark size={vertical ? 26 : 22} />}
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
      {/* sous-titres du dialogue */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: vertical ? 190 : 56 }}>
        <Subtitle lines={DIALOGUE} fontSize={vertical ? 46 : 36} />
      </AbsoluteFill>
      {/* preuve chiffrée */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: vertical ? 'center' : 'flex-start',
          padding: vertical ? '0 0 150px' : `0 0 70px ${pad}px`,
        }}
      >
        <ProofCard
          proof={TEXTS.proofs.receptionniste}
          at={T.proof}
          width={vertical ? 860 : 560}
          size={vertical ? 104 : 76}
        />
      </AbsoluteFill>
    </NavyBackground>
  );
};
