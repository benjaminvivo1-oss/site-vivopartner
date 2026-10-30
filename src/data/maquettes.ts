/**
 * Captures des maquettes de sites (portfolio de /visibilite-locale/ et éventail de l'accueil).
 * Déposer les fichiers dans src/assets/maquettes/ sous les noms climatisation, renovation, electricite
 * (png, jpg, webp ou avif) : ils remplacent automatiquement les dessins provisoires.
 */
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/maquettes/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
});

export type Metier = 'climatisation' | 'renovation' | 'electricite';

export const maquette = (name: Metier): ImageMetadata | undefined =>
  Object.entries(files).find(([path]) => path.split('/').pop()?.split('.')[0] === name)?.[1].default;
