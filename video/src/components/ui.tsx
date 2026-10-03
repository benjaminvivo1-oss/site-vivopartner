import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { springAt, tween, useSceneFrame } from '../anim';
import { COLORS, FONTS, SPRINGS } from '../config';

/* ── Fonds ─────────────────────────────────────────────────────────────────── */

export const DarkBackground: React.FC<{ glow?: string; children?: React.ReactNode }> = ({
  glow = 'rgba(11,47,107,0.55)',
  children,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 90% at 50% 40%, ${glow} 0%, ${COLORS.ink} 62%, #070B16 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

export const NavyBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(110% 80% at 70% 30%, #12408C 0%, ${COLORS.navy} 45%, ${COLORS.navyDeep} 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Fond clair avec trame de points très discrète et halo orange/navy */
export const LightBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: COLORS.white }}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${COLORS.slate200} 1.4px, transparent 1.4px)`,
        backgroundSize: '34px 34px',
        opacity: 0.7,
        maskImage: 'radial-gradient(80% 70% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(80% 70% at 50% 50%, black 30%, transparent 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(40% 35% at 85% 15%, rgba(245,130,32,0.08), transparent 70%), radial-gradient(45% 40% at 10% 90%, rgba(11,47,107,0.07), transparent 70%)',
      }}
    />
    {children}
  </AbsoluteFill>
);

/* ── Carte d'interface ─────────────────────────────────────────────────────── */

export const shadow = {
  sm: '0 1px 2px rgba(15,23,42,0.06), 0 2px 6px rgba(15,23,42,0.04)',
  md: '0 2px 4px rgba(15,23,42,0.04), 0 12px 32px -8px rgba(15,23,42,0.14)',
  lg: '0 4px 8px rgba(15,23,42,0.05), 0 30px 70px -20px rgba(15,23,42,0.30)',
  dark: '0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
};

export const Card: React.FC<{
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ style, children }) => (
  <div
    style={{
      background: COLORS.pureWhite,
      borderRadius: 20,
      boxShadow: shadow.md,
      border: `1px solid ${COLORS.slate200}`,
      fontFamily: FONTS.body,
      color: COLORS.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Apparition « pop » : montée + échelle + fondu, pilotée par un ressort */
export const Pop: React.FC<{
  at: number;
  from?: 'bottom' | 'top' | 'left' | 'right' | 'none';
  distance?: number;
  scaleFrom?: number;
  spring?: { damping: number; mass: number; stiffness: number };
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ at, from = 'bottom', distance = 40, scaleFrom = 0.96, spring = SPRINGS.snappy, style, children }) => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const p = springAt(frame, fps, at, spring);
  const d = (1 - p) * distance;
  const t =
    from === 'bottom'
      ? `translateY(${d}px)`
      : from === 'top'
        ? `translateY(${-d}px)`
        : from === 'left'
          ? `translateX(${-d}px)`
          : from === 'right'
            ? `translateX(${d}px)`
            : '';
  return (
    <div
      style={{
        opacity: Math.min(1, Math.max(0, p * 1.4)),
        transform: `${t} scale(${scaleFrom + (1 - scaleFrom) * p})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Petite étiquette « Pilier N » */
export const Eyebrow: React.FC<{ text: string; at: number; dark?: boolean; size?: number }> = ({
  text,
  at,
  dark = false,
  size = 22,
}) => {
  const frame = useSceneFrame();
  const { fps } = useVideoConfig();
  const p = springAt(frame, fps, at);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.45}px ${size * 0.9}px`,
        borderRadius: 999,
        background: dark ? 'rgba(245,130,32,0.14)' : 'rgba(245,130,32,0.10)',
        border: `1px solid rgba(245,130,32,${dark ? 0.4 : 0.3})`,
        color: COLORS.orange,
        fontFamily: FONTS.body,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
      }}
    >
      <span style={{ width: size * 0.4, height: size * 0.4, borderRadius: 99, background: COLORS.orange }} />
      {text}
    </div>
  );
};

/** Met à l'échelle un bloc dessiné à taille fixe pour qu'il tienne dans la place disponible */
export const Fit: React.FC<{
  designWidth: number;
  designHeight: number;
  maxWidth: number;
  maxHeight: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ designWidth, designHeight, maxWidth, maxHeight, style, children }) => {
  const s = Math.min(maxWidth / designWidth, maxHeight / designHeight);
  return (
    <div style={{ width: designWidth * s, height: designHeight * s, position: 'relative', flexShrink: 0, ...style }}>
      <div
        style={{
          width: designWidth,
          height: designHeight,
          transform: `scale(${s})`,
          transformOrigin: 'top left',
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Ligne de texte factice (squelette d'interface) */
export const Skeleton: React.FC<{ w: number | string; h?: number; color?: string; style?: React.CSSProperties }> = ({
  w,
  h = 10,
  color = COLORS.slate200,
  style,
}) => <div style={{ width: w, height: h, borderRadius: h, background: color, ...style }} />;

/** Pastille de statut */
export const Chip: React.FC<{ label: string; color: string; bg: string; size?: number }> = ({
  label,
  color,
  bg,
  size = 15,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: `${size * 0.3}px ${size * 0.75}px`,
      borderRadius: 999,
      background: bg,
      color,
      fontFamily: FONTS.body,
      fontWeight: 600,
      fontSize: size,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);
