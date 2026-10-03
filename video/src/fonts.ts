import { continueRender, delayRender, staticFile } from 'remotion';

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

const FACES: { family: string; file: string; weight: string; unicodeRange?: string }[] = [
  { family: 'Satoshi', file: 'Satoshi-Medium.woff2', weight: '500' },
  { family: 'Satoshi', file: 'Satoshi-Bold.woff2', weight: '700' },
  { family: 'Satoshi', file: 'Satoshi-Black.woff2', weight: '900' },
  // Inter est une police variable : une seule déclaration couvre 100 → 900
  { family: 'Inter', file: 'Inter-latin.woff2', weight: '100 900', unicodeRange: LATIN },
  { family: 'Inter', file: 'Inter-latin-ext.woff2', weight: '100 900', unicodeRange: LATIN_EXT },
];

let started = false;

/** Charge Satoshi et Inter depuis public/fonts et bloque le rendu tant qu'elles ne sont pas prêtes. */
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Chargement des polices');
  Promise.all(
    FACES.map((f) => {
      const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format('woff2')`, {
        weight: f.weight,
        unicodeRange: f.unicodeRange,
      });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
