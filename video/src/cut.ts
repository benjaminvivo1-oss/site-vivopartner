import { createContext, useContext } from 'react';
import type { CutKey } from './config';

/** Montage en cours (complet ou court) : permet à une scène d'adapter un détail, ex. masquer « Pilier 2 ». */
export const CutContext = createContext<CutKey>('full');
export const useCut = () => useContext(CutContext);
