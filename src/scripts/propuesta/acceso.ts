import * as THREE from 'three';
import { AMBER, CORAL, BLUE, GREEN, RED, WHITE, lazyScene, rng, type SceneCtx, type SceneInstance } from './common';
import { makeDots } from './shaders';

interface Dept {
  pos: THREE.Vector3;
  col: THREE.Color;
}

// Orden = orden de las etiquetas HTML: Legal, RR.HH., Operaciones, Finanzas, Gerencia
const DEPTS: Dept[] = [
  { pos: new THREE.Vector3(-2.8, 1.35, 0.7), col: AMBER },
  { pos: new THREE.Vector3(2.8, 1.35, -0.7), col: CORAL },
  { pos: new THREE.Vector3(-2.8, -1.45, -0.7), col: BLUE },
  { pos: new THREE.Vector3(2.8, -1.45, 0.7), col: GREEN },
];
const GER = new THREE.Vector3(0, 0, 0);
const PERIOD = 7;

function createAcceso(labels: HTMLElement[], denied: HTMLElement | null) {
  return (ctx: SceneCtx): SceneInstance => {
    const { renderer, narrow, reduced } = ctx;
    const rand = rng(99);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    const root = new THREE.Group();
    scene.add(root);

    const perDept = narrow ? 5 : 7;
    const edgePos: number[] = [];
    const edgeCol: number[] = [];
    const edges: { a: THREE.Vector3; b: THREE.Vector3; col: THREE.Color }[] = [];
    const addEdge = (a: THREE.Vector3, b: THREE.Vector3, col: THREE.Color, k: number) => {
      edgePos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      edgeCol.push(col.r * k, col.g * k, col.b * k, col.r * k, col.g * k, col.b * k);
      edges.push({ a, b, col });
    };

    const nodePos: number[] = [];
    const nodeCol: number[] = [];
    const nodeSize: number[] = [];
    const addNode = (p: THREE.Vector3, c: THREE.Color, s: number) => {
      nodePos.push(p.x, p.y, p.z);
      nodeCol.push(c.r, c.g, c.b);
      nodeSize.push(s);
    };

    // Departamentos + sus usuarios (solo conectados a su area)
    const usersByDept: THREE.Vector3[][] = [];
    DEPTS.forEach((d) => {
      const out = d.pos.clone().normalize();
      const list: THREE.Vector3[] = [];
      for (let i = 0; i < perDept; i++) {
        const u = d.pos
          .clone()
          .addScaledVector(out, 1.25 + rand() * 0.7)
          .add(new THREE.Vector3((rand() - 0.5) * 1.5, (rand() - 0.5) * 1.5, (rand() - 0.5) * 1.5));
        list.push(u);
        addNode(u, d.col, 1.1);
        addEdge(u, d.pos, d.col, 0.5);
      }
      usersByDept.push(list);
      addNode(d.pos, d.col, 5.2); // brillo
      // Gerencia conecta con todas las areas
      addEdge(GER, d.pos, WHITE, 0.32);
    });
    // Gerencia y sus usuarios
    addNode(GER, WHITE, 6.2);
    const gerUsers = [new THREE.Vector3(-0.55, 2.55, 0.3), new THREE.Vector3(0.45, 2.75, -0.3), new THREE.Vector3(0.05, 2.25, 0.7)];
    gerUsers.forEach((u) => {
      addNode(u, WHITE, 1.2);
      addEdge(u, GER, WHITE, 0.4);
    });

    // Aristas
    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
    eg.setAttribute('color', new THREE.Float32BufferAttribute(edgeCol, 3));
    root.add(
      new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85 })),
    );

    // Esferas de area y Gerencia
    const sphereGeo = new THREE.SphereGeometry(0.3, 28, 20);
    DEPTS.forEach((d) => {
      const m = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: d.col }));
      m.position.copy(d.pos);
      root.add(m);
    });
    const gerMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), new THREE.MeshBasicMaterial({ color: WHITE }));
    root.add(gerMesh);

    // Nodos (usuarios + brillos)
    const nodes = makeDots(new Float32Array(nodePos), new Float32Array(nodeCol), new Float32Array(nodeSize), 1);
    (nodes.material as THREE.ShaderMaterial).uniforms.uGain.value = 0.75;
    root.add(nodes);

    // Pulsos por las aristas
    const PULSES = narrow ? 22 : 40;
    const pulseEdge: number[] = [];
    const pulsePhase: number[] = [];
    const pulseSpeed: number[] = [];
    const pPos = new Float32Array(PULSES * 3);
    const pCol = new Float32Array(PULSES * 3);
    const pSize = new Float32Array(PULSES).fill(1.5);
    for (let i = 0; i < PULSES; i++) {
      const ei = Math.floor(rand() * edges.length);
      pulseEdge.push(ei);
      pulsePhase.push(rand());
      pulseSpeed.push(0.18 + rand() * 0.22);
      const c = edges[ei].col;
      pCol.set([Math.min(1, c.r * 1.3), Math.min(1, c.g * 1.3), Math.min(1, c.b * 1.3)], i * 3);
    }
    const pulses = makeDots(pPos, pCol, pSize, 1);
    root.add(pulses);

    // Arista bloqueada: usuario de Legal -> Finanzas (area ajena)
    const attacker = usersByDept[0][0];
    const target = DEPTS[3].pos;
    const blockGeo = new THREE.BufferGeometry();
    blockGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const blockMat = new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: 0 });
    const blockLine = new THREE.Line(blockGeo, blockMat);
    blockLine.frustumCulled = false;
    root.add(blockLine);
    const markPos = new Float32Array(3);
    const markCol = new Float32Array([RED.r, RED.g, RED.b]);
    const markSize = new Float32Array([0]);
    const mark = makeDots(markPos, markCol, markSize, 1);
    root.add(mark);
    const attackerGlow = makeDots(
      new Float32Array([attacker.x, attacker.y, attacker.z]),
      new Float32Array([RED.r, RED.g, RED.b]),
      new Float32Array([0]),
      1,
    );
    root.add(attackerGlow);

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

    const tmp = new THREE.Vector3();
    const cut = new THREE.Vector3();
    const labelPos = [...DEPTS.map((d) => d.pos), GER];
    let lastDenied = '';

    const pixUniforms = [nodes, pulses, mark, attackerGlow].map((o) => (o.material as THREE.ShaderMaterial).uniforms.uPix);

    return {
      resize(w, h, dpr) {
        camera.aspect = w / h;
        const halfW = 5.6;
        const z = halfW / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
        camera.position.set(0, 0.6, Math.max(13, z));
        camera.lookAt(0, 0.35, 0);
        camera.updateProjectionMatrix();
        pixUniforms.forEach((u) => (u.value = dpr * (h / 640)));
      },
      frame(t) {
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        root.rotation.y = Math.sin(t * 0.12) * 0.5 + mouse.x * 0.25;
        root.rotation.x = 0.12 + mouse.y * 0.1;
        root.updateMatrixWorld(true);

        // Pulsos
        for (let i = 0; i < PULSES; i++) {
          const e = edges[pulseEdge[i]];
          const ph = reduced ? pulsePhase[i] : (pulsePhase[i] + t * pulseSpeed[i]) % 1;
          // Los usuarios envian hacia el area (a -> b); Gerencia -> area va en el mismo sentido
          tmp.lerpVectors(e.a, e.b, ph);
          pPos.set([tmp.x, tmp.y, tmp.z], i * 3);
        }
        (pulses.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

        // Permiso denegado
        const ph = reduced ? 2.2 : t % PERIOD;
        let s = 0;
        let alpha = 0;
        let markK = 0;
        if (ph < 1.4) {
          s = 0.58 * (1 - Math.pow(1 - ph / 1.4, 3));
          alpha = 0.9;
        } else if (ph < 1.9) {
          s = 0.58;
          alpha = 0.95;
          markK = (ph - 1.4) / 0.5;
        } else if (ph < 3.4) {
          const k = (ph - 1.9) / 1.5;
          s = 0.58 * (1 - k * k);
          alpha = 0.95 * (1 - k);
          markK = 1 - k;
        }
        const pa = blockGeo.attributes.position as THREE.BufferAttribute;
        cut.lerpVectors(attacker, target, s);
        pa.setXYZ(0, attacker.x, attacker.y, attacker.z);
        pa.setXYZ(1, cut.x, cut.y, cut.z);
        pa.needsUpdate = true;
        blockMat.opacity = alpha;
        markPos.set([cut.x, cut.y, cut.z]);
        (mark.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        markSize[0] = markK > 0 ? 3.2 + Math.sin(markK * Math.PI) * 4 : 0;
        (mark.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
        (attackerGlow.geometry.attributes.aSize as THREE.BufferAttribute).array[0] = alpha > 0 ? 2.6 : 0;
        (attackerGlow.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;

        if (denied) {
          const show = ph > 1.4 && ph < 3.2 ? '1' : '0';
          if (show !== lastDenied) {
            lastDenied = show;
            denied.style.opacity = show;
          }
        }

        // Etiquetas HTML proyectadas
        const w = ctx.canvas.clientWidth;
        const h = ctx.canvas.clientHeight;
        labels.forEach((el, i) => {
          tmp.copy(labelPos[i]);
          root.localToWorld(tmp);
          tmp.project(camera);
          const x = (tmp.x * 0.5 + 0.5) * w;
          const y = (-tmp.y * 0.5 + 0.5) * h;
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, 18px)`;
        });

        renderer.render(scene, camera);
      },
    };
  };
}

export function initAcceso(canvas: HTMLCanvasElement, labels: HTMLElement[], denied: HTMLElement | null) {
  lazyScene(canvas, createAcceso(labels, denied));
}
