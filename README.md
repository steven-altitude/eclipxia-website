# Eclipxia — Landing

Sitio web oficial de **Eclipxia** (eclipxia.com) — consultoría e ingeniería de IA, Samborondón, Ecuador.

Landing de una sola página, oscuro y monocromo, construido con **Astro 5** y desplegado en **Vercel**. Sin frameworks de CSS: todo el estilo está escrito a mano en `src/styles/global.css`. Las animaciones son keyframes CSS + un único script vanilla (anillo eclipse en canvas, headline kinético, highlight progresivo del manifiesto, marquee y scroll-reveal).

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # build de producción → dist/
npm run preview   # previsualizar el build
```

## Estructura

- `src/pages/index.astro` — toda la landing (markup por secciones + script de interacciones)
- `src/layouts/BaseLayout.astro` — `<head>`, SEO, fuentes Geist, JSON-LD, analytics
- `src/styles/global.css` — design tokens, secciones, responsive
- `public/eclipxia-logo.png` — wordmark

CTA principal en todo el sitio: `mailto:hola@eclipxia.com`.
