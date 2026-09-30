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
  // Règles d'espacement JSX (défaut d'Astro 7) : les retours à la ligne entre balises sont ignorés,
  // les espaces significatifs sont écrits explicitement ({' '}), comme le fait Prettier.
  compressHTML: 'jsx',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
