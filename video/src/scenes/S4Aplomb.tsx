import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { springAt, tween, useLayout } from '../anim';
import { COLORS, FONTS, SPRINGS, TEXTS } from '../config';
import { Icon, IconName } from '../components/Icon';
import { WordReveal } from '../components/WordReveal';
import { Card, Chip, Eyebrow, Fit, LightBackground, Pop, Skeleton, shadow } from '../components/ui';

/* Scène 4 (21 → 31 s) — PILIER 1 : APLOMB. Tableau de bord SaaS animé :
   devis générés, relances automatiques, avis Google, suivi de chantier. */

const DW = 1240;
const DH = 780;
/* Version portrait (9:16) : grille sur 2 colonnes */
const DW_V = 900;
const DH_V = 1120;

/** Timeline interne (images locales) */
export const T = {
  window: 14,
  quotes: [40, 58, 76],
  quoteSent: 22, // délai entre « Génération… » et « Envoyé »
  relances: [92, 110, 128],
  reviews: 140,
  chantier: 156,
  chart: 172,
};

const CardTitle: React.FC<{ icon: IconName; label: string; right?: React.ReactNode }> = ({ icon, label, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: 'rgba(11,47,107,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={19} color={COLORS.navy} />
    </div>
    <div style={{ fontWeight: 600, fontSize: 18, color: COLORS.ink, flex: 1 }}>{label}</div>
    {right}
  </div>
);

const Spinner: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      width: 14,
      height: 14,
      borderRadius: 99,
      border: `2px solid ${COLORS.slate200}`,
      borderTopColor: COLORS.navy,
      transform: `rotate(${frame * 18}deg)`,
    }}
  />
);

const QUOTES = ['Rénovation salle de bain', 'Mise aux normes électriques', 'Remplacement chaudière'];

const QuotesCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Card style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}>
    <CardTitle
      icon="file"
      label="Devis"
      right={<Chip label="Automatique" color={COLORS.navy} bg="rgba(11,47,107,0.07)" size={13} />}
    />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {QUOTES.map((q, i) => {
        const at = T.quotes[i];
        const p = springAt(frame, fps, at, SPRINGS.snappy);
        const sent = frame >= at + T.quoteSent;
        const chipPop = springAt(frame, fps, at + T.quoteSent, SPRINGS.bouncy);
        return (
          <div
            key={q}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 14,
              background: COLORS.slate100,
              opacity: p,
              transform: `translateX(${(1 - p) * -24}px)`,
            }}
          >
            <Icon name="file" size={22} color={COLORS.slate500} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{q}</div>
              <Skeleton w={160} h={7} style={{ marginTop: 8 }} />
            </div>
            {sent ? (
              <div style={{ transform: `scale(${0.7 + 0.3 * chipPop})` }}>
                <Chip label="✓ Envoyé" color={COLORS.success} bg="rgba(22,163,74,0.10)" size={14} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: COLORS.slate500 }}>
                <Spinner frame={frame} /> Génération…
              </div>
            )}
          </div>
        );
      })}
    </div>
  </Card>
);

const RELANCES = [
  { label: 'Relance e-mail', sub: 'J+2' },
  { label: 'Relance SMS', sub: 'J+5' },
  { label: 'Devis signé', sub: 'Client' },
];

const RelancesCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Card style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}>
    <CardTitle icon="refresh" label="Relances auto" />
    <div style={{ position: 'relative', paddingLeft: 6 }}>
      {RELANCES.map((r, i) => {
        const p = springAt(frame, fps, T.relances[i], SPRINGS.bouncy);
        const line = tween(frame, [T.relances[i], T.relances[i] + 16], [0, 1]);
        const last = i === RELANCES.length - 1;
        return (
          <div key={r.label} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: last ? 0 : 26 }}>
            {!last && (
              <div
                style={{
                  position: 'absolute',
                  left: 15,
                  top: 34,
                  width: 2,
                  height: 'calc(100% - 34px)',
                  background: COLORS.slate200,
                }}
              >
                <div style={{ width: '100%', height: `${line * 100}%`, background: COLORS.orange }} />
              </div>
            )}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 99,
                flexShrink: 0,
                background: p > 0.05 ? (last ? COLORS.success : COLORS.orange) : COLORS.slate100,
                border: `2px solid ${p > 0.05 ? 'transparent' : COLORS.slate200}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${0.8 + 0.2 * p})`,
              }}
            >
              <div style={{ transform: `scale(${p})` }}>
                <Icon name="check" size={18} color="white" strokeWidth={3} />
              </div>
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: p > 0.05 ? COLORS.ink : COLORS.slate500 }}>
                {r.label}
              </div>
              <div style={{ fontSize: 13, color: COLORS.slate500, marginTop: 3 }}>{r.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);

const ReviewsCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Card style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}>
    <CardTitle
      icon="star"
      label="Avis Google"
      right={<Chip label="Nouveau" color={COLORS.orange} bg="rgba(245,130,32,0.12)" size={13} />}
    />
    <div style={{ display: 'flex', gap: 6 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const p = springAt(frame, fps, T.reviews + 8 + i * 5, SPRINGS.bouncy);
        return (
          <div key={i} style={{ position: 'relative', width: 34, height: 34 }}>
            <Icon name="star" size={34} color={COLORS.slate200} fill={COLORS.slate100} strokeWidth={1.5} />
            <div style={{ position: 'absolute', inset: 0, transform: `scale(${p})`, opacity: Math.min(1, p) }}>
              <Icon name="star" size={34} color={COLORS.orange} fill={COLORS.orange} strokeWidth={1.5} />
            </div>
          </div>
        );
      })}
    </div>
    <div
      style={{
        marginTop: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity: tween(frame, [T.reviews + 30, T.reviews + 45], [0, 1]),
      }}
    >
      <div style={{ fontSize: 15, color: COLORS.slate500 }}>Nouvel avis reçu</div>
      <Skeleton w="90%" h={8} />
      <Skeleton w="65%" h={8} />
    </div>
  </Card>
);

const CHANTIERS = [
  { label: 'Salle de bain', target: 0.82 },
  { label: 'Tableau électrique', target: 0.48 },
  { label: 'Toiture', target: 1 },
];

const ChantierCard: React.FC<{ frame: number }> = ({ frame }) => (
  <Card style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}>
    <CardTitle icon="hardHat" label="Suivi de chantier" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {CHANTIERS.map((c, i) => {
        const v = tween(frame, [T.chantier + i * 8, T.chantier + i * 8 + 50], [0, c.target]);
        const done = v >= 0.999;
        return (
          <div key={c.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 7 }}>
              <span style={{ fontWeight: 600 }}>{c.label}</span>
              <span style={{ color: done ? COLORS.success : COLORS.slate500, fontWeight: done ? 600 : 400 }}>
                {done ? 'Terminé' : 'En cours'}
              </span>
            </div>
            <div style={{ height: 9, borderRadius: 9, background: COLORS.slate100, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${v * 100}%`,
                  height: '100%',
                  borderRadius: 9,
                  background: done ? COLORS.success : `linear-gradient(90deg, ${COLORS.navy}, #2A5DB0)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);

const BARS = [0.32, 0.45, 0.4, 0.58, 0.66, 0.78, 0.95];

const ChartCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => (
  <Card style={{ padding: 24, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
    <CardTitle icon="trendingUp" label="Activité" />
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, paddingTop: 6 }}>
      {BARS.map((h, i) => {
        const p = springAt(frame, fps, T.chart + i * 4, SPRINGS.snappy);
        const last = i === BARS.length - 1;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100 * p}%`,
              borderRadius: 8,
              background: last ? COLORS.orange : i > 3 ? COLORS.navy : 'rgba(11,47,107,0.25)',
            }}
          />
        );
      })}
    </div>
  </Card>
);

const NAV: IconName[] = ['grid', 'file', 'refresh', 'star', 'hardHat', 'calendar', 'users'];

const Dashboard: React.FC<{ frame: number; fps: number; vertical: boolean }> = ({ frame, fps, vertical }) => {
  // L'onglet actif de la barre latérale suit la carte en cours d'animation
  const active =
    frame >= T.chart
      ? 0
      : frame >= T.chantier
        ? 4
        : frame >= T.reviews
          ? 3
          : frame >= T.relances[0]
            ? 2
            : frame >= T.quotes[0]
              ? 1
              : 0;
  return (
    <div
      style={{
        width: vertical ? DW_V : DW,
        height: vertical ? DH_V : DH,
        borderRadius: 26,
        background: COLORS.white,
        boxShadow: shadow.lg,
        border: `1px solid ${COLORS.slate200}`,
        overflow: 'hidden',
        display: 'flex',
        fontFamily: FONTS.body,
      }}
    >
      {/* barre latérale */}
      <div
        style={{
          width: 88,
          background: COLORS.navy,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 26,
          gap: 14,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: COLORS.orange,
            color: COLORS.navy,
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          A
        </div>
        {NAV.map((n, i) => (
          <div
            key={n}
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: i === active ? 'rgba(255,255,255,0.14)' : 'transparent',
            }}
          >
            <Icon name={n} size={22} color={i === active ? COLORS.white : 'rgba(248,250,252,0.5)'} />
          </div>
        ))}
      </div>

      {/* contenu */}
      <div style={{ flex: 1, padding: 30, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 28, color: COLORS.ink }}>
              Tableau de bord
            </div>
            <div style={{ fontSize: 15, color: COLORS.slate500, marginTop: 4 }}>Tout tourne. Vous gardez la main.</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 12,
              background: COLORS.pureWhite,
              border: `1px solid ${COLORS.slate200}`,
              width: 220,
              color: COLORS.slate500,
              fontSize: 15,
            }}
          >
            <Icon name="search" size={18} color={COLORS.slate500} /> Rechercher
          </div>
          <div style={{ position: 'relative' }}>
            <Icon name="bell" size={26} color={COLORS.ink} />
            <div
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 10,
                height: 10,
                borderRadius: 9,
                background: COLORS.orange,
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: vertical ? '1fr 1fr' : '1fr 1fr 1fr',
            gridTemplateRows: vertical ? '1.1fr 1fr 1fr' : '1.15fr 1fr',
            gap: 20,
          }}
        >
          <Pop at={T.quotes[0] - 10} style={{ gridColumn: 'span 2' }}>
            <QuotesCard frame={frame} fps={fps} />
          </Pop>
          <Pop at={T.relances[0] - 10}>
            <RelancesCard frame={frame} fps={fps} />
          </Pop>
          <Pop at={T.reviews - 6}>
            <ReviewsCard frame={frame} fps={fps} />
          </Pop>
          <Pop at={T.chantier - 6}>
            <ChantierCard frame={frame} />
          </Pop>
          <Pop at={T.chart - 6}>
            <ChartCard frame={frame} fps={fps} />
          </Pop>
        </div>
      </div>
    </div>
  );
};

export const S4Aplomb: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { vertical, width, height, pad } = useLayout();

  const w = springAt(frame, fps, T.window, SPRINGS.soft, 40);
  const tiltX = (1 - w) * 18 + tween(frame, [T.window, 300], [6, 2]);
  const tiltY = (1 - w) * -22 + tween(frame, [T.window, 300], [-10, -4]);

  const dash = (
    <div style={{ perspective: 2400 }}>
      <div
        style={{
          transform: `translateY(${(1 - w) * 120}px) rotateX(${tiltX}deg) rotateY(${vertical ? 0 : tiltY}deg)`,
          opacity: w,
          transformStyle: 'preserve-3d',
        }}
      >
        <Fit
          designWidth={vertical ? DW_V : DW}
          designHeight={vertical ? DH_V : DH}
          maxWidth={vertical ? width - pad * 2 + 40 : width * 0.62}
          maxHeight={vertical ? height * 0.6 : height - 200}
        >
          <Dashboard frame={frame} fps={fps} vertical={vertical} />
        </Fit>
      </div>
    </div>
  );

  const text = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: vertical ? 'center' : 'flex-start',
        gap: 26,
        width: vertical ? '100%' : width * 0.28,
        flexShrink: 0,
      }}
    >
      <Eyebrow text={TEXTS.aplomb.eyebrow} at={4} size={vertical ? 26 : 22} />
      <WordReveal
        text={TEXTS.aplomb.title}
        start={8}
        fontSize={vertical ? 160 : 132}
        weight={900}
        color={COLORS.navy}
        letterSpacing="-0.04em"
        lineHeight={0.95}
      />
      <WordReveal
        text={TEXTS.aplomb.subtitle}
        start={22}
        fontSize={vertical ? 64 : 52}
        weight={700}
        color={COLORS.ink}
        align={vertical ? 'center' : 'left'}
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
          gap: vertical ? 70 : 70,
          padding: pad,
        }}
      >
        {text}
        {dash}
      </AbsoluteFill>
    </LightBackground>
  );
};
