import React from 'react';
import { COLORS } from '../config';

/** Smartphone générique (sans marque), dessiné à 390 × 800 */
export const PHONE_W = 390;
export const PHONE_H = 800;

export const Phone: React.FC<{
  screen?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ screen = COLORS.ink, style, children }) => (
  <div
    style={{
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 64,
      padding: 12,
      background: 'linear-gradient(145deg, #2A3242 0%, #0B0F18 60%, #1B2230 100%)',
      boxShadow:
        '0 0 0 2px rgba(255,255,255,0.08) inset, 0 50px 100px -30px rgba(0,0,0,0.55), 0 20px 40px -20px rgba(0,0,0,0.4)',
      position: 'relative',
      ...style,
    }}
  >
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 52,
        overflow: 'hidden',
        background: screen,
        position: 'relative',
      }}
    >
      {children}
      {/* îlot caméra */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          width: 110,
          height: 32,
          marginLeft: -55,
          borderRadius: 20,
          background: '#05070C',
        }}
      />
    </div>
  </div>
);
