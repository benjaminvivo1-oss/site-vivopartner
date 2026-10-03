import React from 'react';
import { SceneKey } from '../config';
import { S1Hook } from './S1Hook';
import { S2Probleme } from './S2Probleme';
import { S3Bascule } from './S3Bascule';
import { S4Aplomb } from './S4Aplomb';
import { S5Receptionniste } from './S5Receptionniste';
import { S6Visibilite } from './S6Visibilite';
import { S7Benefices } from './S7Benefices';
import { S8Cta } from './S8Cta';

/** Composant + type d'entrée de chaque scène.
 *  'fade' : fondu enchaîné par-dessus la scène précédente.
 *  'none' : la scène gère elle-même sa transition (ex. cercle blanc de la bascule). */
export const SCENES: Record<SceneKey, { component: React.FC; title: string; enter: 'fade' | 'none' }> = {
  hook: { component: S1Hook, title: 'S1-Hook', enter: 'none' },
  probleme: { component: S2Probleme, title: 'S2-Probleme', enter: 'fade' },
  bascule: { component: S3Bascule, title: 'S3-Bascule', enter: 'none' },
  aplomb: { component: S4Aplomb, title: 'S4-Aplomb', enter: 'fade' },
  receptionniste: { component: S5Receptionniste, title: 'S5-Receptionniste', enter: 'fade' },
  visibilite: { component: S6Visibilite, title: 'S6-Visibilite', enter: 'fade' },
  benefices: { component: S7Benefices, title: 'S7-Benefices', enter: 'fade' },
  cta: { component: S8Cta, title: 'S8-CTA', enter: 'fade' },
};
