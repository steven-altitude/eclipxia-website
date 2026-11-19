import * as THREE from 'three';

// Los colores se usan tal cual se escriben (sin conversion lineal) para que los
// shaders y los materiales basicos coincidan con los hex del diseno.
THREE.ColorManagement.enabled = false;

export const MAX_DPR = 1.75;
export const AMBER = new THREE.Color('#FFB547');
export const CORAL = new THREE.Color('#FF6A3D');
export const BLUE = new THREE.Color('#4DA3FF');
export const GREEN = new THREE.Color('#3DDC97');
export const RED = new THREE.Color('#FF5D5D');
export const WHITE = new THREE.Color('#F2F2F4');

const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
const narrowMQ = matchMedia('(max-width: 819px)');
export const isReduced = () => reducedMQ.matches;
export const isNarrow = () => narrowMQ.matches;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** RNG determinista para que las escenas se vean igual en cada carga. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Progreso 0..1 de una pista alta (secciones sticky) segun el scroll. */
export function trackProgress(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  const total = r.height - innerHeight;
  return total <= 0 ? 0 : clamp(-r.top / total);
}

export interface SceneCtx {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  narrow: boolean;
  reduced: boolean;
}
export interface SceneInstance {
  frame(time: number, dt: number): void;
  resize(w: number, h: number, dpr: number): void;
}
export type SceneFactory = (ctx: SceneCtx) => SceneInstance;

/** Tiempo que se usa para el frame estatico con prefers-reduced-motion. */
export const STATIC_TIME = 9;

/**
 * Crea la escena solo cuando el canvas entra al viewport, la pausa fuera de
 * pantalla, limita el DPR y renderiza un unico frame si hay reduced-motion.
 */
export function lazyScene(canvas: HTMLCanvasElement, factory: SceneFactory): void {
  let renderer: THREE.WebGLRenderer | null = null;
  let inst: SceneInstance | null = null;
  let visible = false;
  let failed = false;
  let raf = 0;
  let last = 0;
  let time = 0;
  const host = canvas.parentElement as HTMLElement;

  const size = () => ({ w: Math.max(1, canvas.clientWidth), h: Math.max(1, canvas.clientHeight) });

  const init = () => {
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      const { w, h } = size();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      inst = factory({ renderer, canvas, width: w, height: h, narrow: isNarrow(), reduced: isReduced() });
      inst.resize(w, h, dpr);
      return true;
    } catch (e) {
      failed = true;
      host.classList.add('no-webgl');
      console.warn('WebGL no disponible', e);
      return false;
    }
  };

  const loop = (now: number) => {
    if (!visible || !inst) {
      raf = 0;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    time += dt;
    inst.frame(time, dt);
    raf = requestAnimationFrame(loop);
  };

  const drawStatic = () => {
    if (inst) inst.frame(STATIC_TIME, 0);
  };

  new IntersectionObserver(
    (entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (!visible || failed) return;
      if (!inst && !init()) return;
      if (isReduced()) {
        drawStatic();
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    },
    { rootMargin: '120px 0px' },
  ).observe(canvas);

  new ResizeObserver(() => {
    if (!renderer || !inst) return;
    const { w, h } = size();
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    inst.resize(w, h, dpr);
    if (isReduced() || !raf) drawStatic();
  }).observe(canvas);
}
