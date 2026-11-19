import { initProgress, initReveal, initConsumo } from './ui';

initProgress();
initReveal();
initConsumo();

// Las escenas de three.js se cargan en un chunk aparte, solo si hay canvas.
const q = <T extends HTMLElement>(s: string) => document.querySelector<T>(s);
const qa = <T extends HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s));

const heroCanvas = q<HTMLCanvasElement>('[data-scene="hero"]');
const ragCanvas = q<HTMLCanvasElement>('[data-scene="rag"]');
const accCanvas = q<HTMLCanvasElement>('[data-scene="acceso"]');
const arqCanvas = q<HTMLCanvasElement>('[data-scene="arq"]');

if (heroCanvas) import('./hero').then((m) => m.initHero(heroCanvas));

if (ragCanvas) {
  const track = q('[data-rag-track]');
  if (track) {
    import('./rag').then((m) => m.initRag(ragCanvas, track, qa('[data-rag-step]'), q('[data-rag-bar]')));
  }
}

if (accCanvas) {
  import('./acceso').then((m) => m.initAcceso(accCanvas, qa('[data-acc-label]'), q('[data-acc-denied]')));
}

if (arqCanvas) {
  const track = q('[data-arq-track]');
  if (track) {
    let hover = -1;
    const legend = qa('[data-arq-layer]');
    legend.forEach((el, i) => {
      el.addEventListener('pointerenter', () => (hover = i));
      el.addEventListener('pointerleave', () => (hover = -1));
      el.addEventListener('focus', () => (hover = i));
      el.addEventListener('blur', () => (hover = -1));
    });
    import('./arq').then((m) =>
      m.initArq(arqCanvas, {
        track,
        legend,
        chipUsers: q('[data-arq-chip="users"]'),
        chipLlm: q('[data-arq-chip="llm"]'),
        getHover: () => hover,
      }),
    );
  }
}
