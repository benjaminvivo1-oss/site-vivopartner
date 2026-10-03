import React from 'react';

/* Pictogrammes au trait (style Lucide), dessinés sur une grille 24×24. */
const PATHS = {
  phone: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  ],
  phoneMissed: [
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
    'M23 1l-6 6',
    'M17 1l6 6',
  ],
  mail: [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7',
  ],
  file: [
    'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z',
    'M14 2v6h6',
    'M16 13H8',
    'M16 17H8',
    'M10 9H8',
  ],
  clock: ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z', 'M12 6v6l4 2'],
  star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  pin: ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 1 0 0-6z'],
  calendar: [
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M16 2v4',
    'M8 2v4',
    'M3 10h18',
  ],
  check: ['M20 6L9 17l-5-5'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  mic: ['M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z', 'M19 10v2a7 7 0 0 1-14 0v-2', 'M12 19v3'],
  refresh: [
    'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
    'M21 3v5h-5',
    'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
    'M8 16H3v5',
  ],
  hardHat: [
    'M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z',
    'M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5',
    'M4 15v-3a6 6 0 0 1 6-6',
    'M14 6a6 6 0 0 1 6 6v3',
  ],
  trendingUp: ['M22 7l-8.5 8.5-5-5L2 17', 'M16 7h6v6'],
  globe: ['M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z', 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', 'M2 12h20'],
  arrowRight: ['M5 12h14', 'M12 5l7 7-7 7'],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z'],
  bot: [
    'M5 11h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z',
    'M12 7v4',
    'M12 3a2 2 0 1 0 0 4 2 2 0 1 0 0-4z',
    'M8 16h.01',
    'M16 16h.01',
  ],
  search: ['M11 3a8 8 0 1 0 0 16 8 8 0 1 0 0-16z', 'M21 21l-4.3-4.3'],
  grid: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
  users: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  euro: ['M4 10h12', 'M4 14h9', 'M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2'],
  message: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
} as const;

export type IconName = keyof typeof PATHS;

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 24, color = 'currentColor', strokeWidth = 2, fill = 'none', style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0, ...style }}
  >
    {PATHS[name].map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);
