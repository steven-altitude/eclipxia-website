import * as THREE from 'three';

/** Brillo de borde (fresnel) ambar -> coral para esferas. Aditivo. */
export function coronaMaterial(a: THREE.Color, b: THREE.Color, power = 3, gain = 1.2) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uA: { value: a },
      uB: { value: b },
      uPow: { value: power },
      uGain: { value: gain },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform float uPow; uniform float uGain;
      void main(){
        float f = 1.0 - max(dot(normalize(vN), normalize(vV)), 0.0);
        float rim = pow(f, uPow);
        float swirl = 0.5 + 0.5 * sin(uTime * 0.6 + vN.x * 3.0 + vN.y * 2.0);
        vec3 c = mix(uA, uB, clamp(f * 1.15 + 0.3 * swirl - 0.2, 0.0, 1.0));
        gl_FragColor = vec4(c * rim * uGain, 0.0);
      }`,
    transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    depthWrite: false,
  });
}

/** Halo plano (anillo + caida suave) para un plano que mira a la camara. */
export function haloMaterial(a: THREE.Color, b: THREE.Color, r0: number, gain = 1) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uA: { value: a },
      uB: { value: b },
      uR0: { value: r0 },
      uGain: { value: gain },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      varying vec2 vUv; uniform float uTime; uniform vec3 uA; uniform vec3 uB; uniform float uR0; uniform float uGain;
      void main(){
        vec2 p = vUv - 0.5;
        float r = length(p) * 2.0;
        float ang = atan(p.y, p.x);
        float streak = 0.78 + 0.22 * sin(ang * 5.0 + uTime * 0.35) * sin(ang * 3.0 - uTime * 0.2);
        float d = max(r - uR0, 0.0);
        float ring = exp(-pow((r - uR0) / 0.05, 2.0));
        float glow = exp(-d * 7.0) * 0.6 * streak;
        float far = exp(-d * 2.4) * 0.16;
        float fade = smoothstep(1.0, 0.72, r);
        float k = (ring * 1.1 + glow + far) * fade;
        vec3 c = mix(uA, uB, smoothstep(uR0, uR0 + 0.3, r));
        gl_FragColor = vec4(c * k * uGain, 0.0);
      }`,
    transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    depthWrite: false,
  });
}

/** Puntos circulares con color y tamano por atributo. Aditivos. */
export function dotMaterial(pix: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uPix: { value: pix }, uGain: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor; attribute float aSize;
      uniform float uPix; varying vec3 vC;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vC = aColor;
        gl_PointSize = aSize * uPix * (30.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vC; uniform float uGain;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vC * (core * core * 1.4 + core * 0.35) * uGain, 0.0);
      }`,
    transparent: true,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
    depthWrite: false,
  });
}

/** Crea un Points con dotMaterial a partir de arrays. */
export function makeDots(pos: Float32Array, col: Float32Array, size: Float32Array, pix: number) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  const p = new THREE.Points(g, dotMaterial(pix));
  p.frustumCulled = false;
  return p;
}
