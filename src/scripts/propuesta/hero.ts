import * as THREE from 'three';
import { AMBER, CORAL, BLUE, clamp, lazyScene, rng, type SceneCtx, type SceneInstance } from './common';
import { coronaMaterial, haloMaterial } from './shaders';

const ORBIT_VERT = /* glsl */ `
  attribute vec4 aOrb;   // radio, angulo inicial, velocidad, altura
  attribute vec2 aRnd;   // tamano, brillo
  uniform float uTime; uniform float uPix;
  varying float vR; varying float vB;
  void main(){
    float ang = aOrb.y + uTime * aOrb.z;
    vec3 p = vec3(cos(ang) * aOrb.x, aOrb.w, sin(ang) * aOrb.x);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aRnd.x * uPix * (22.0 / -mv.z);
    vR = aOrb.x; vB = aRnd.y;
  }`;
const ORBIT_FRAG = /* glsl */ `
  uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
  varying float vR; varying float vB;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float k = smoothstep(0.5, 0.0, d);
    float t = clamp((vR - 1.9) / 4.6, 0.0, 1.0);
    vec3 c = mix(uA, uB, t);
    c = mix(c, uC, step(0.93, vB) * 0.8);
    gl_FragColor = vec4(c * k * k * (0.5 + vB * 0.9), 0.0);
  }`;

function createHero(ctx: SceneCtx): SceneInstance {
  const { renderer, narrow, reduced } = ctx;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const BASE_Z = 8.5;
  camera.position.set(0, 0, BASE_Z);

  const eclipse = new THREE.Group();
  scene.add(eclipse);

  // Esfera negra (el "sol" tapado)
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 48), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  eclipse.add(core);

  // Corona en el borde (fresnel ambar -> coral)
  const coronaMat = coronaMaterial(AMBER, CORAL, 3.2, 1.35);
  const corona = new THREE.Mesh(new THREE.SphereGeometry(1.23, 64, 48), coronaMat);
  corona.renderOrder = 2;
  eclipse.add(corona);

  // Halo aditivo detras de la esfera (mira siempre a la camara)
  const haloMat = haloMaterial(AMBER, CORAL, 0.31, 1.0);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), haloMat);
  halo.position.z = -1.0;
  halo.renderOrder = 1;
  eclipse.add(halo);

  // Particulas en orbita
  const COUNT = narrow ? 2800 : 7000;
  const rand = rng(7);
  const orb = new Float32Array(COUNT * 4);
  const rnd = new Float32Array(COUNT * 2);
  const dummy = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 1.9 + Math.pow(rand(), 1.6) * 4.6;
    const thick = 0.08 + (r / 6.5) * 0.55;
    const g = (rand() + rand() + rand() - 1.5) * thick;
    orb[i * 4] = r;
    orb[i * 4 + 1] = rand() * Math.PI * 2;
    orb[i * 4 + 2] = (0.22 / Math.pow(r, 1.1)) * (rand() < 0.1 ? -0.6 : 1);
    orb[i * 4 + 3] = g;
    rnd[i * 2] = 0.7 + rand() * 1.5;
    rnd[i * 2 + 1] = rand();
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(dummy, 3));
  pg.setAttribute('aOrb', new THREE.BufferAttribute(orb, 4));
  pg.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 2));
  const pMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPix: { value: 1 },
      uA: { value: AMBER },
      uB: { value: CORAL },
      uC: { value: BLUE },
    },
    vertexShader: ORBIT_VERT,
    fragmentShader: ORBIT_FRAG,
    transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    depthWrite: false,
  });
  const particles = new THREE.Points(pg, pMat);
  particles.frustumCulled = false;
  particles.rotation.set(0.38, 0, -0.14);
  eclipse.add(particles);

  // Parallax con el mouse
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduced) {
    window.addEventListener(
      'pointermove',
      (e) => {
        mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
        mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
      },
      { passive: true },
    );
  }

  let isNarrowView = narrow;

  return {
    resize(w, h, dpr) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      pMat.uniforms.uPix.value = dpr * (h / 900);
      isNarrowView = w < 820;
      // Desktop: eclipse a la derecha, el texto queda a la izquierda. Movil: arriba.
      eclipse.position.set(isNarrowView ? 0 : 2.5, isNarrowView ? 1.5 : 0, 0);
      eclipse.scale.setScalar(isNarrowView ? 0.85 : 1);
    },
    frame(t) {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const sc = reduced ? 0 : clamp(window.scrollY / innerHeight, 0, 1.2);
      camera.position.set(mouse.x * 0.7, -mouse.y * 0.45, BASE_Z - sc * 1.9);
      camera.lookAt(isNarrowView ? 0 : 1.2, isNarrowView ? 0.8 : 0, 0);
      halo.quaternion.copy(camera.quaternion);
      pMat.uniforms.uTime.value = t;
      coronaMat.uniforms.uTime.value = t;
      haloMat.uniforms.uTime.value = t;
      renderer.render(scene, camera);
    },
  };
}

export function initHero(canvas: HTMLCanvasElement) {
  lazyScene(canvas, createHero);
}
