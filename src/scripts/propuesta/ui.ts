const isReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Barra de progreso de scroll + fondo de la barra superior. */
export function initProgress() {
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  const top = document.querySelector<HTMLElement>('.pp-top');
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    if (top) top.classList.toggle('is-scrolled', scrollY > 24);
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', update, { passive: true });
  update();
}

/** Reveal con stagger (la variable --i define el retraso). */
export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Contadores y medidores de CONSUMO. */
export function initConsumo() {
  const root = document.querySelector<HTMLElement>('[data-consumo]');
  if (!root) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-meter]'));
  const zone = (v: number) => (v >= 90 ? 'hot' : v >= 70 ? 'warn' : 'ok');

  const run = () => {
    root.classList.add('in');
    items.forEach((it) => {
      const to = Number(it.dataset.value || 0);
      const num = it.querySelector<HTMLElement>('[data-num]');
      it.style.setProperty('--v', String(to / 100));
      it.dataset.zone = zone(to);
      if (!num) return;
      if (isReduced()) {
        num.textContent = String(to);
        return;
      }
      const t0 = performance.now();
      const dur = 1500;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        num.textContent = String(Math.round(to * ease(k)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  new IntersectionObserver(
    (entries, io) => {
      if (entries.some((e) => e.isIntersecting)) {
        run();
        io.disconnect();
      }
    },
    { threshold: 0.3 },
  ).observe(root);
}
