// @ts-check
import { defineConfig } from 'astro/config';

// Domaine supposé dans la maquette : à confirmer avant la mise en ligne (voir README).
export default defineConfig({
  site: 'https://vivopartner.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS du site très léger : on l'insère dans chaque page pour éviter une requête bloquante.
    inlineStylesheets: 'always',
  },
  // Compression sans perte : conserve les espaces significatifs entre éléments en ligne,
  // comme dans la maquette HTML.
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
