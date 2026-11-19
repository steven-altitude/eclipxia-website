import * as THREE from 'three';
import { AMBER, CORAL, BLUE, GREEN, WHITE, clamp, isNarrow, lazyScene, rng, smooth, trackProgress, type SceneCtx, type SceneInstance } from './common';
import { coronaMaterial, makeDots } from './shaders';

const LAYER_COLORS = [AMBER, BLUE, CORAL, new THREE.Color('#7DBBFF'), GREEN, new THREE.Color('#C8C8CE')];
const LOOP_SECONDS = 9;
const USERS_X = -7;
const LLM_X = 7;

interface Hooks {
  track: HTMLElement;
  legend: HTMLElement[];
  chipUsers: HTMLElement | null;
  chipLlm: HTMLElement | null;
  getHover: () => number;
}

function createArq(h: Hooks) {
  return (ctx: SceneCtx): SceneInstance => {
    const { renderer, narrow, reduced } = ctx;
    const rand = rng(5);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(4.2, 6.2, 9.4);
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group();
    scene.add(root);

    // Losas (capas)
    const slabGeo = new THREE.BoxGeometry(5, 0.14, 3.6);
    const edgeGeo = new THREE.EdgesGeometry(slabGeo);
    const chipGeo = new THREE.BoxGeometry(0.34, 0.07, 0.34);
    const slabs: { g: THREE.Group; fill: THREE.MeshBasicMaterial; line: THREE.LineBasicMaterial }[] = [];
    LAYER_COLORS.forEach((c) => {
      const g = new THREE.Group();
      const fill = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.2, depthWrite: false });
      g.add(new THREE.Mesh(slabGeo, fill));
      const line = new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.9 });
      g.add(new THREE.LineSegments(edgeGeo, line));
      const chipMat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 });
      for (let k = 0; k < 7; k++) {
        const m = new THREE.Mesh(chipGeo, chipMat);
        m.position.set((rand() - 0.5) * 4.1, 0.1, (rand() - 0.5) * 2.7);
        g.add(m);
      }
      root.add(g);
      slabs.push({ g, fill, line });
    });

    // Perimetro verde
    const boxGeo = new THREE.BoxGeometry(5.8, 1, 4.3);
    const perim = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeo),
      new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.95 }),
    );
    root.add(perim);
    const volMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.035, side: THREE.BackSide, depthWrite: false });
    const vol = new THREE.Mesh(boxGeo, volMat);
    root.add(vol);

    // Usuarios a la izquierda
    const UN = narrow ? 10 : 16;
    const uPos = new Float32Array(UN * 3);
    const uCol = new Float32Array(UN * 3);
    const uSize = new Float32Array(UN);
    const uBase: THREE.Vector3[] = [];
    for (let i = 0; i < UN; i++) {
      const p = new THREE.Vector3(USERS_X + (rand() - 0.5) * 0.9, (rand() - 0.5) * 2.2 + 0.4, (rand() - 0.5) * 2.4);
      uBase.push(p);
      uCol.set([WHITE.r, WHITE.g, WHITE.b], i * 3);
      uSize[i] = 1.7;
    }
    const users = makeDots(uPos, uCol, uSize, 1);
    root.add(users);

    // LLM a la derecha
    const llm = new THREE.Group();
    llm.position.x = LLM_X;
    root.add(llm);
    llm.add(
      new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.8, 1),
        new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: 0.7 }),
      ),
    );
    const llmCoreMat = coronaMaterial(AMBER, CORAL, 2.2, 0.9);
    llm.add(new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), llmCoreMat));
    llm.add(new THREE.Mesh(new THREE.SphereGeometry(0.58, 32, 24), new THREE.MeshBasicMaterial({ color: 0x000000 })));

    // Flujo de particulas: usuarios -> capas -> LLM
    const FN = narrow ? 36 : 70;
    const fPos = new Float32Array(FN * 3);
    const fCol = new Float32Array(FN * 3);
    const fSize = new Float32Array(FN).fill(1.5);
    const fOff: number[] = [];
    const fUser: number[] = [];
    const fSpd: number[] = [];
    for (let i = 0; i < FN; i++) {
      fOff.push(rand());
      fUser.push(Math.floor(rand() * UN));
      fSpd.push(0.07 + rand() * 0.04);
    }
    const flow = makeDots(fPos, fCol, fSize, 1);
    root.add(flow);

    const pixUniforms = [users, flow].map((o) => (o.material as THREE.ShaderMaterial).uniforms.uPix);
    const path: THREE.Vector3[] = [0, 1, 2, 3, 4, 5, 6].map(() => new THREE.Vector3());
    const lens = new Array(path.length - 1).fill(0);
    const tmp = new THREE.Vector3();
    const proj = new THREE.Vector3();

    let active = -1;
    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      h.legend.forEach((el, k) => el.classList.toggle('is-active', k === i));
    };

    const placeChip = (el: HTMLElement | null, p: THREE.Vector3) => {
      if (!el) return;
      proj.copy(p);
      root.localToWorld(proj);
      proj.project(camera);
      const w = ctx.canvas.clientWidth;
      const hh = ctx.canvas.clientHeight;
      const half = el.offsetWidth / 2;
      const x = clamp((proj.x * 0.5 + 0.5) * w, half + 6, w - half - 6);
      const y = (-proj.y * 0.5 + 0.5) * hh;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    };

    return {
      resize(w, hgt, dpr) {
        const aspect = w / hgt;
        let hw = narrow || w < 820 ? 9.2 : 8.6;
        let hh = hw / aspect;
        if (hh < 4.6) {
          hh = 4.6;
          hw = hh * aspect;
        }
        camera.left = -hw;
        camera.right = hw;
        camera.top = hh;
        camera.bottom = -hh;
        camera.updateProjectionMatrix();
        pixUniforms.forEach((u) => (u.value = dpr * (hgt / 640)));
      },
      frame(t) {
        let e: number;
        if (reduced) e = 1;
        else if (isNarrow()) e = 0.5 - 0.5 * Math.cos(((t % LOOP_SECONDS) / LOOP_SECONDS) * Math.PI * 2);
        else e = smooth(0.08, 0.75, trackProgress(h.track));

        const gap = 0.34 + e * 0.95;
        const ys = slabs.map((_, i) => (2.5 - i) * gap);
        slabs.forEach((s, i) => (s.g.position.y = ys[i]));
        const span = gap * 5 + 1.1;
        perim.scale.y = span;
        vol.scale.y = span;

        const hover = h.getHover();
        const act = hover >= 0 ? hover : reduced ? 0 : Math.floor(t / 1.8) % slabs.length;
        slabs.forEach((s, i) => {
          const on = i === act;
          s.fill.opacity = on ? 0.42 : 0.17;
          s.line.opacity = on ? 1 : 0.7;
        });
        setActive(act);

        // Usuarios
        for (let i = 0; i < UN; i++) {
          const b = uBase[i];
          uPos.set([b.x, b.y + Math.sin(t * 0.8 + i) * 0.08, b.z], i * 3);
        }
        (users.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        // Ruta: usuario -> Interfaz -> Motor -> Pasarela -> salida -> LLM
        path[1].set(-2.9, ys[0], 0);
        path[2].set(0, ys[0], 0);
        path[3].set(0, ys[1], 0);
        path[4].set(0, ys[2], 0);
        path[5].set(2.9, ys[2], 0);
        path[6].set(LLM_X - 0.9, ys[2] * 0.4, 0);
        for (let i = 0; i < FN; i++) {
          path[0].copy(uBase[fUser[i]]);
          let total = 0;
          for (let k = 0; k < lens.length; k++) {
            lens[k] = path[k].distanceTo(path[k + 1]);
            total += lens[k];
          }
          const ph = reduced ? fOff[i] : (fOff[i] + t * fSpd[i]) % 1;
          let d = ph * total;
          let k = 0;
          while (k < lens.length - 1 && d > lens[k]) {
            d -= lens[k];
            k++;
          }
          tmp.lerpVectors(path[k], path[k + 1], clamp(d / lens[k]));
          fPos.set([tmp.x, tmp.y, tmp.z], i * 3);
          const out = k >= 4 && (k > 4 || tmp.x > 0);
          const c = out ? AMBER : GREEN;
          fCol.set([c.r, c.g, c.b], i * 3);
        }
        (flow.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (flow.geometry.attributes.aColor as THREE.BufferAttribute).needsUpdate = true;

        llm.position.y = ys[2] * 0.4;
        llm.rotation.y = t * 0.4;
        llm.rotation.x = t * 0.2;
        llmCoreMat.uniforms.uTime.value = t;

        placeChip(h.chipUsers, new THREE.Vector3(USERS_X, 1.9, 0));
        placeChip(h.chipLlm, new THREE.Vector3(LLM_X, ys[2] * 0.4 + 1.3, 0));

        renderer.render(scene, camera);
      },
    };
  };
}

export function initArq(canvas: HTMLCanvasElement, hooks: Hooks) {
  lazyScene(canvas, createArq(hooks));
}
