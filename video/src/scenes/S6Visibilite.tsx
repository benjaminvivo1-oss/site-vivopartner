import React from 'react';
import { AbsoluteFill, interpolate, useVideoConfig } from 'remotion';
import { EASE_IN_OUT, springAt, tween, useLayout, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { Icon, IconName } from '../components/Icon';
import { Phone } from '../components/Phone';
import { ProofCard } from '../components/Proof';
import { WordReveal } from '../components/WordReveal';
import { Card, Eyebrow, Fit, LightBackground, Pop, Skeleton, shadow } from '../components/ui';

/* Scène 6 — PILIER 3 : VISIBILITÉ. Pin Google Maps qui tombe,
   fiche avec étoiles, site mobile, courbe de visites qui monte. */

const SW = 1180;
const SH = 760;
/* Version portrait (9:16) */
const SW_V = 760;
const SH_V = 1120;

export const T = {
  /** Preuve chiffrée (images d'animation) */
  proof: 82,
  map: 4,
  pin: 12,
  listing: 28,
  stars: 38,
  phone: 52,
  scroll: [80, 170] as [number, number],
  chart: 88,
  line: [96, 172] as [number, number],
};

const MapCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const drop = springAt(frame, fps, T.pin, SPRINGS.bouncy);
  const landed = frame - (T.pin + 8);
  const ripple = landed > 0 ? (landed % 40) / 40 : 0;
  return (
    <Card
      style={{
        width: 660,
        height: 440,
        borderRadius: 28,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: shadow.lg,
        border: 'none',
      }}
    >
      {/* carte stylisée */}
      <svg width={660} height={440} style={{ position: 'absolute', inset: 0 }}>
        <rect width={660} height={440} fill="#EEF2F6" />
        <path
          d="M-20 300 C 120 260, 220 330, 360 280 S 600 200, 700 230"
          stroke="#D6E4F5"
          strokeWidth={34}
          fill="none"
        />
        <rect x={40} y={40} width={150} height={90} rx={10} fill="#E3EAD9" />
        <rect x={470} y={300} width={170} height={110} rx={10} fill="#E3EAD9" />
        {['M0 120 L660 160', 'M0 380 L660 330', 'M230 0 L280 440', 'M440 0 L400 440', 'M90 440 L160 0'].map((d, i) => (
          <path key={i} d={d} stroke="#FFFFFF" strokeWidth={i < 2 ? 16 : 10} fill="none" />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <rect
            key={i}
            x={20 + ((i * 97) % 600)}
            y={170 + ((i * 53) % 120)}
            width={34}
            height={24}
            rx={5}
            fill="#E2E8F0"
          />
        ))}
      </svg>
      {/* pin */}
      <div style={{ position: 'absolute', left: 330 - 40, top: 150 }}>
        <div
          style={{
            position: 'absolute',
            left: 40 - 50,
            top: 96,
            width: 100,
            height: 100,
            marginTop: -50,
            borderRadius: '50%',
            border: `3px solid ${COLORS.orange}`,
            opacity: landed > 0 ? (1 - ripple) * 0.6 : 0,
            transform: `scaleY(0.4) scale(${0.3 + ripple * 1.4})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 40 - 22,
            top: 90,
            width: 44,
            height: 14,
            borderRadius: '50%',
            background: 'rgba(15,23,42,0.25)',
            filter: 'blur(3px)',
            transform: `scale(${drop})`,
            opacity: drop,
          }}
        />
        <div style={{ transform: `translateY(${(1 - drop) * -260}px)`, opacity: frame >= T.pin ? 1 : 0 }}>
          <Icon
            name="pin"
            size={80}
            color={COLORS.white}
            fill={COLORS.orange}
            strokeWidth={1.4}
            style={{ filter: 'drop-shadow(0 8px 10px rgba(245,130,32,0.45))' }}
          />
        </div>
      </div>
    </Card>
  );
};

const ListingCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const actions: [IconName, string][] = [
    ['phone', 'Appeler'],
    ['pin', 'Itinéraire'],
    ['globe', 'Site web'],
  ];
  return (
    <Card style={{ width: 500, padding: 26, borderRadius: 24, boxShadow: shadow.lg, border: 'none' }}>
      <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 28, color: COLORS.ink }}>
        {TEXTS.visibilite.businessName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const p = springAt(frame, fps, T.stars + i * 5, SPRINGS.bouncy);
          return (
            <div key={i} style={{ position: 'relative', width: 26, height: 26 }}>
              <Icon name="star" size={26} color={COLORS.slate200} fill={COLORS.slate100} strokeWidth={1.5} />
              <div style={{ position: 'absolute', inset: 0, transform: `scale(${p})` }}>
                <Icon name="star" size={26} color={COLORS.orange} fill={COLORS.orange} strokeWidth={1.5} />
              </div>
            </div>
          );
        })}
        <span style={{ marginLeft: 10, fontSize: 16, color: COLORS.slate500 }}>{TEXTS.visibilite.businessTrade}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {actions.map(([icon, label], i) => (
          <div
            key={label}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '11px 0',
              borderRadius: 99,
              border: `1px solid ${COLORS.slate200}`,
              background: i === 0 ? COLORS.navy : COLORS.pureWhite,
              color: i === 0 ? COLORS.white : COLORS.navy,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            <Icon name={icon} size={16} color={i === 0 ? COLORS.white : COLORS.navy} />
            {label}
          </div>
        ))}
      </div>
    </Card>
  );
};

const MobileSite: React.FC<{ frame: number }> = ({ frame }) => {
  const scroll = tween(frame, [T.scroll[0], T.scroll[1]], [0, -150], EASE_IN_OUT);
  return (
    <Phone screen={COLORS.pureWhite}>
      {/* barre d'état fixe : le contenu défile dessous */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: COLORS.pureWhite, zIndex: 1 }}
      />
      <div style={{ transform: `translateY(${scroll}px)`, fontFamily: FONTS.body }}>
        <div style={{ height: 64 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: COLORS.navy }} />
            <Skeleton w={90} h={10} color={COLORS.ink} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Skeleton w={24} h={3} color={COLORS.ink} />
            <Skeleton w={24} h={3} color={COLORS.ink} />
          </div>
        </div>
        <div
          style={{
            margin: '0 14px',
            borderRadius: 24,
            padding: '34px 22px',
            background: `linear-gradient(160deg, ${COLORS.navy}, #163F86)`,
            color: COLORS.white,
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontWeight: 900,
              fontSize: 34,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            {TEXTS.visibilite.siteHero}
          </div>
          <Skeleton w="85%" h={8} color="rgba(255,255,255,0.35)" style={{ marginTop: 18 }} />
          <Skeleton w="60%" h={8} color="rgba(255,255,255,0.35)" style={{ marginTop: 10 }} />
          <div
            style={{
              marginTop: 24,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 20px',
              borderRadius: 14,
              background: COLORS.orange,
              color: COLORS.ink,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {TEXTS.visibilite.siteCta} <Icon name="arrowRight" size={18} color={COLORS.ink} />
          </div>
        </div>
        <div style={{ padding: '26px 24px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(['hardHat', 'calendar', 'star', 'phone'] as IconName[]).map((ic) => (
            <div
              key={ic}
              style={{
                borderRadius: 16,
                background: COLORS.slate100,
                padding: 16,
                height: 110,
                boxSizing: 'border-box',
              }}
            >
              <Icon name={ic} size={24} color={COLORS.navy} />
              <Skeleton w="80%" h={8} style={{ marginTop: 18 }} color={COLORS.slate200} />
              <Skeleton w="55%" h={8} style={{ marginTop: 8 }} color={COLORS.slate200} />
            </div>
          ))}
        </div>
        <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton w="90%" />
          <Skeleton w="75%" />
          <Skeleton w="82%" />
        </div>
      </div>
    </Phone>
  );
};

const ChartCard: React.FC<{ frame: number }> = ({ frame }) => {
  const W = 440;
  const H = 150;
  const pts = [0.12, 0.18, 0.15, 0.28, 0.34, 0.31, 0.48, 0.56, 0.7, 0.86];
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H - v * H] as const);
  const d = xy.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = xy[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, '');
  const prog = tween(frame, T.line, [0, 1], EASE_IN_OUT);
  const LEN = 700;
  // point qui suit la courbe
  const idx = prog * (pts.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(pts.length - 1, i0 + 1);
  const dx = interpolate(idx, [i0, i0 + 1], [xy[i0][0], xy[i1][0]], { extrapolateRight: 'clamp' });
  const dy = interpolate(idx, [i0, i0 + 1], [xy[i0][1], xy[i1][1]], { extrapolateRight: 'clamp' });
  return (
    <Card style={{ width: 500, padding: 26, borderRadius: 24, boxShadow: shadow.lg, border: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Icon name="trendingUp" size={22} color={COLORS.orange} />
        <div style={{ fontWeight: 600, fontSize: 18, flex: 1 }}>{TEXTS.visibilite.chartLabel}</div>
      </div>
      <svg width={W} height={H + 10} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="vp-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.28} />
            <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0} />
          </linearGradient>
          <clipPath id="vp-reveal">
            <rect x={0} y={-20} width={W * prog} height={H + 40} />
          </clipPath>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke={COLORS.slate100} strokeWidth={2} />
        ))}
        <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill="url(#vp-area)" clipPath="url(#vp-reveal)" />
        <path
          d={d}
          fill="none"
          stroke={COLORS.orange}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={LEN}
          strokeDashoffset={LEN * (1 - prog)}
        />
        {prog > 0.01 && <circle cx={dx} cy={dy} r={9} fill={COLORS.orange} stroke="white" strokeWidth={4} />}
      </svg>
    </Card>
  );
};

const Stage: React.FC<{ frame: number; fps: number; vertical: boolean }> = ({ frame, fps, vertical }) => (
  <div style={{ width: vertical ? SW_V : SW, height: vertical ? SH_V : SH, position: 'relative' }}>
    <Pop at={T.map} distance={50} style={{ position: 'absolute', left: 0, top: 0 }}>
      <MapCard frame={frame} fps={fps} />
    </Pop>
    <Pop
      at={T.phone}
      from="bottom"
      distance={140}
      scaleFrom={0.92}
      style={{ position: 'absolute', right: vertical ? 0 : 70, top: vertical ? 330 : -10 }}
    >
      <div style={{ transform: 'scale(0.86)', transformOrigin: 'top right' }}>
        <MobileSite frame={frame} />
      </div>
    </Pop>
    <Pop
      at={T.listing}
      distance={50}
      style={{ position: 'absolute', left: vertical ? 0 : 60, top: vertical ? 470 : 380 }}
    >
      <ListingCard frame={frame} fps={fps} />
    </Pop>
    <Pop
      at={T.chart}
      from={vertical ? 'bottom' : 'right'}
      distance={60}
      style={{ position: 'absolute', right: vertical ? 'auto' : 0, left: vertical ? 0 : 'auto', bottom: 0 }}
    >
      <ChartCard frame={frame} />
    </Pop>
  </div>
);

export const S6Visibilite: React.FC = () => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const { vertical, width, height, pad } = useLayout();
  const [l1, l2] = TEXTS.visibilite.lines;
  const fs = vertical ? 72 : 60;

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
      <Eyebrow text={TEXTS.visibilite.eyebrow} at={4} size={vertical ? 26 : 22} />
      <WordReveal text={l1} start={8} fontSize={fs} color={COLORS.ink} align={vertical ? 'center' : 'left'} />
      <WordReveal
        text={l2}
        start={40}
        fontSize={fs * 1.25}
        weight={900}
        color={COLORS.navy}
        align={vertical ? 'center' : 'left'}
        letterSpacing="-0.035em"
      />
    </div>
  );

  return (
    <LightBackground>
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
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: vertical ? 'center' : 'flex-start',
          padding: vertical ? '0 0 120px' : `0 0 70px ${pad}px`,
        }}
      >
        <ProofCard
          proof={TEXTS.proofs.visibilite}
          at={T.proof}
          width={vertical ? 860 : 560}
          size={vertical ? 104 : 76}
        />
      </AbsoluteFill>
    </LightBackground>
  );
};
