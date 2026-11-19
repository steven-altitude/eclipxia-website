import * as THREE from 'three';
import { AMBER, CORAL, BLUE, clamp, lazyScene, rng, smooth, type SceneCtx, type SceneInstance } from './common';
import { coronaMaterial, haloMaterial } from './shaders';

const LUT = 48;
const CLOUD_C = new THREE.Vector3(1.3, 0, 0);
const NODE_P = new THREE.Vector3(5.1, 0.35, 0);
const LOOP_SECONDS = 14; // animacion automatica y lenta, de ingesta a respuesta

const DOC_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const DOC_FRAG = /* glsl */ `
  varying vec2 vUv; uniform float uAppear; uniform float uFrag; uniform float uSeed;
  float h(vec2 c){ return fract(sin(dot(c, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
  void main(){
    vec2 g = vec2(10.0, 14.0);
    vec2 cell = floor(vUv * g);
    if (h(cell) < uFrag * 1.05) discard;
    vec3 col = vec3(0.075, 0.095, 0.16);
    float row = fract(vUv.y * g.y);
    float w = 0.45 + 0.5 * h(vec2(cell.y, 1.0));
    float has = step(0.12, vUv.x) * step(vUv.x, 0.12 + 0.76 * w);
    float txt = step(0.38, row) * step(row, 0.68) * has * step(0.08, vUv.y) * step(vUv.y, 0.92);
    col = mix(col, vec3(0.30, 0.64, 1.0), txt * 0.75);
    float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    col += smoothstep(0.035, 0.0, e) * vec3(0.30, 0.64, 1.0) * 0.7;
    gl_FragColor = vec4(col, uAppear * 0.94);
  }`;

const FRAG_VERT = /* glsl */ `
  attribute vec3 aEnd; attribute vec4 aRnd; attribute vec2 aMisc;
  uniform float uTime; uniform float uPix; uniform float uFrag; uniform float uTravel; uniform float uSel;
  uniform vec3 uCurve[${LUT}];
  varying vec3 vCol; varying float vAlpha;
  void main(){
    vec3 start = position + (aRnd.xyz - 0.5) * 0.9 * smoothstep(0.0, 1.0, uFrag);
    float tt = clamp((uTravel - aRnd.w * 0.5) / 0.5, 0.0, 1.0);
    tt = tt * tt * (3.0 - 2.0 * tt);
    float f = tt * ${(LUT - 1).toFixed(1)};
    int i0 = int(floor(f));
    int i1 = min(i0 + 1, ${LUT - 1});
    vec3 c = mix(uCurve[i0], uCurve[i1], f - float(i0));
    vec3 pCurve = c + (aRnd.xyz - 0.5) * 1.2 * sin(3.14159 * tt);
    vec3 pos = mix(start, pCurve, smoothstep(0.0, 0.12, tt));
    pos = mix(pos, aEnd, smoothstep(0.7, 1.0, tt));
    pos += 0.045 * vec3(sin(uTime + aRnd.x * 20.0), cos(uTime * 0.9 + aRnd.y * 20.0), sin(uTime * 1.1 + aRnd.z * 20.0)) * smoothstep(0.9, 1.0, tt);

    float selF = aMisc.y * uSel;
    vec3 base = mix(vec3(0.75, 0.88, 1.0), vec3(0.30, 0.64, 1.0), smoothstep(0.0, 0.5, tt));
    vCol = mix(base, vec3(1.0, 0.71, 0.28), selF);
    float vis = smoothstep(aRnd.w * 0.9, aRnd.w * 0.9 + 0.08, uFrag);
    vAlpha = vis * (1.0 - 0.6 * uSel * (1.0 - aMisc.y));

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aMisc.x * (1.0 + 1.3 * selF) * uPix * (26.0 / -mv.z);
  }`;
const FRAG_FRAG = /* glsl */ `
  varying vec3 vCol; varying float vAlpha;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float k = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vCol * (k * k * 1.3 + k * 0.3) * vAlpha, 0.0);
  }`;

const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const BEAM_FRAG = /* glsl */ `
  varying vec2 vUv; uniform float uProg; uniform float uGain; uniform vec3 uCol;
  void main(){
    if (vUv.x > uProg) discard;
    float head = smoothstep(uProg - 0.2, uProg, vUv.x);
    gl_FragColor = vec4(uCol * (0.55 + 1.2 * head) * uGain, 0.0);
  }`;

function createRag(track: HTMLElement, steps: HTMLElement[], bar: HTMLElement | null) {
  return (ctx: SceneCtx): SceneInstance => {
    const { renderer, narrow, reduced } = ctx;
    const rand = rng(21);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    // Documentos
    const docs = new THREE.Group();
    scene.add(docs);
    const docMats: THREE.ShaderMaterial[] = [];
    const docMeshes: THREE.Mesh[] = [];
    const DOC_N = 5;
    for (let i = 0; i < DOC_N; i++) {
      const m = new THREE.ShaderMaterial({
        uniforms: { uAppear: { value: 0 }, uFrag: { value: 0 }, uSeed: { value: i * 3.7 } },
        vertexShader: DOC_VERT,
        fragmentShader: DOC_FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2), m);
      mesh.position.set(-4.5 + i * 0.3, (i - 2) * 0.3, (i - 2) * 0.28);
      mesh.rotation.set(0, 0.4, (i - 2) * 0.05);
      docs.add(mesh);
      docMats.push(m);
      docMeshes.push(mesh);
    }
    docs.updateMatrixWorld(true);

    // Curva por la que viajan los fragmentos
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.5, 0.2, 0),
      new THREE.Vector3(-2.1, 1.5, 0.9),
      new THREE.Vector3(-0.8, -1.0, -0.7),
      new THREE.Vector3(0.2, 0.6, 0.4),
      CLOUD_C.clone(),
    ]);
    const lut = curve.getPoints(LUT - 1);

    // Fragmentos / nube vectorial
    const N = narrow ? 800 : 1800;
    const start = new Float32Array(N * 3);
    const end = new Float32Array(N * 3);
    const rnd = new Float32Array(N * 4);
    const misc = new Float32Array(N * 2);
    const clusters = [
      new THREE.Vector3(-0.2, 0.7, 0.3),
      new THREE.Vector3(0.9, -0.8, -0.4),
      new THREE.Vector3(2.0, 0.5, 0.5),
      new THREE.Vector3(1.5, -0.2, -0.9),
    ].map((v) => v.add(new THREE.Vector3(0.2, 0, 0)));
    const v = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const d = docMeshes[Math.floor(rand() * DOC_N)];
      const cx = Math.floor(rand() * 10);
      const cy = Math.floor(rand() * 14);
      const ux = (cx + rand()) / 10;
      const uy = (cy + rand()) / 14;
      v.set((ux - 0.5) * 1.5, (uy - 0.5) * 2, 0);
      d.localToWorld(v);
      start.set([v.x, v.y, v.z], i * 3);
      const c = clusters[Math.floor(rand() * clusters.length)];
      const g = () => (rand() + rand() + rand() - 1.5) * 0.75;
      const ex = c.x + g();
      end.set([ex, c.y + g(), c.z + g()], i * 3);
      rnd.set([rand(), rand(), rand(), rand()], i * 4);
      const selected = ex > CLOUD_C.x + 0.9 && Math.abs(end[i * 3 + 1]) < 0.9 && rand() < 0.55 ? 1 : 0;
      misc.set([0.8 + rand() * 1.3, selected], i * 2);
    }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.BufferAttribute(start, 3));
    fg.setAttribute('aEnd', new THREE.BufferAttribute(end, 3));
    fg.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
    fg.setAttribute('aMisc', new THREE.BufferAttribute(misc, 2));
    const fMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPix: { value: 1 },
        uFrag: { value: 0 },
        uTravel: { value: 0 },
        uSel: { value: 0 },
        uCurve: { value: lut },
      },
      vertexShader: FRAG_VERT,
      fragmentShader: FRAG_FRAG,
      transparent: true,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
      depthWrite: false,
    });
    const frags = new THREE.Points(fg, fMat);
    frags.frustumCulled = false;
    scene.add(frags);

    // Malla tenue alrededor del indice
    const wireMat = new THREE.MeshBasicMaterial({ color: BLUE, wireframe: true, transparent: true, opacity: 0, depthWrite: false });
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 2), wireMat);
    wire.position.copy(CLOUD_C).add(new THREE.Vector3(0.2, 0, 0));
    scene.add(wire);

    // Haz ambar nube -> respuesta
    const beamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.6, 0.1, 0.1),
      new THREE.Vector3(3.8, 0.95, 0.3),
      NODE_P.clone().add(new THREE.Vector3(-0.45, 0, 0)),
    ]);
    const mkBeam = (radius: number, gain: number) => {
      const m = new THREE.ShaderMaterial({
        uniforms: { uProg: { value: 0 }, uGain: { value: gain }, uCol: { value: AMBER } },
        vertexShader: BEAM_VERT,
        fragmentShader: BEAM_FRAG,
        transparent: true,
        blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(beamCurve, 64, radius, 6, false), m);
      scene.add(mesh);
      return m;
    };
    const beamCore = mkBeam(0.028, 1);
    const beamGlow = mkBeam(0.13, 0.12);

    // Nodo respuesta
    const node = new THREE.Group();
    node.position.copy(NODE_P);
    scene.add(node);
    node.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 30), new THREE.MeshBasicMaterial({ color: 0x000000 })));
    const nodeCorona = coronaMaterial(AMBER, CORAL, 2.6, 0.2);
    const nc = new THREE.Mesh(new THREE.SphereGeometry(0.42, 40, 30), nodeCorona);
    nc.renderOrder = 2;
    node.add(nc);
    const nodeHalo = haloMaterial(AMBER, CORAL, 0.3, 0.15);
    const nh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), nodeHalo);
    nh.position.z = -0.6;
    nh.renderOrder = 1;
    node.add(nh);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.012, 8, 96),
      new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.3 }),
    );
    ring.rotation.x = 1.15;
    node.add(ring);

    let active = -1;
    const setActive = (i: number) => {
      if (i === active) return;
      active = i;
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      if (bar) bar.style.setProperty('--p', String((i + 1) / steps.length));
    };

    const fit = (w: number, h: number) => {
      camera.aspect = w / h;
      const halfW = 6.1;
      const z = halfW / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
      camera.position.set(0.3, 0.3, Math.max(11, z));
      camera.lookAt(0.3, 0, 0);
      camera.updateProjectionMatrix();
    };

    return {
      resize(w, h, dpr) {
        fit(w, h);
        fMat.uniforms.uPix.value = dpr * (h / 700);
      },
      frame(t) {
        // Loop automatico (no depende del scroll); al final se sostiene la respuesta unos segundos.
        const p = reduced ? 1 : clamp(((t % LOOP_SECONDS) / LOOP_SECONDS) * 1.14);

        const frag = smooth(0.18, 0.38, p);
        const travel = clamp((p - 0.38) / 0.22);
        const sel = smooth(0.6, 0.7, p);
        const beam = clamp((p - 0.78) / 0.16);
        const light = smooth(0.9, 1.0, p);
        const appear = smooth(0, 0.16, p);

        docMats.forEach((m, i) => {
          m.uniforms.uAppear.value = clamp(appear * 1.4 - i * 0.08);
          m.uniforms.uFrag.value = frag;
        });
        docs.position.x = (1 - appear) * -1.5;
        docs.position.y = Math.sin(t * 0.6) * 0.06;

        fMat.uniforms.uTime.value = t;
        fMat.uniforms.uFrag.value = frag;
        fMat.uniforms.uTravel.value = travel;
        fMat.uniforms.uSel.value = sel;
        wireMat.opacity = 0.07 * smooth(0.5, 0.62, p);
        wire.rotation.y = t * 0.08;
        wire.rotation.x = t * 0.04;

        beamCore.uniforms.uProg.value = beam;
        beamGlow.uniforms.uProg.value = beam;
        nodeCorona.uniforms.uGain.value = 0.2 + 1.2 * light;
        nodeCorona.uniforms.uTime.value = t;
        nodeHalo.uniforms.uGain.value = 0.12 + 0.95 * light;
        nodeHalo.uniforms.uTime.value = t;
        nh.quaternion.copy(camera.quaternion);
        ring.rotation.z = t * 0.5;
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.22 + 0.5 * light;

        if (!reduced) setActive(p < 0.18 ? 0 : p < 0.38 ? 1 : p < 0.6 ? 2 : p < 0.78 ? 3 : 4);
        renderer.render(scene, camera);
      },
    };
  };
}

export function initRag(canvas: HTMLCanvasElement, track: HTMLElement, steps: HTMLElement[], bar: HTMLElement | null) {
  lazyScene(canvas, createRag(track, steps, bar));
}
