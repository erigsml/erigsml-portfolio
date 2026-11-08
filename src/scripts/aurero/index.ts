import {
  Color,
  DoubleSide,
  DynamicDrawUsage,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { birdFragment, birdGeometry, birdVertex, SPANS, type Species } from './birds';
import { BIRD_COUNTS, MOBILE_MAX_WIDTH } from './config';
import { blitFragment, blitVertex, skyFragment, skyVertex } from './sky';
import { hour, luz } from '../reloj';

interface Thermal {
  nx: number; ny: number;   // posición actual, en pantalla normalizada (-1..1)
  tnx: number; tny: number; // hacia dónde se desplaza
  dir: 1 | -1;              // sentido de giro predominante
}

interface Bird {
  sp: Species; i: number; th: number; z: number;
  r: number; a: number; dir: number; v: number; phase: number; s: number;
  sx: number; sy: number; delay: number;
  x: number; y: number; h: number; bank: number;
}

export interface MountOptions {
  /** Elemento donde un clic mueve la térmica (la portada). */
  clickArea?: HTMLElement | null;
  /**
   * Zonas transparentes por las que se ve el cielo. Si ninguna está en
   * pantalla (el índice lo tapa), la animación se pausa.
   */
  windows?: (HTMLElement | null)[];
}

const REF_DEPTH = 30;        // a esta distancia se miden las térmicas
const SKY_SCALE = 0.66;      // resolución del cielo respecto a la pantalla
const SCROLL_TRAVEL = 14;    // cuánto "sube" la cámara al recorrer toda la página
// Bruma de las aves lejanas: se funden con el color del cielo de cada hora.
const HAZE_DAY = new Color(0.6, 0.72, 0.9);
const HAZE_HIGH = new Color(0.3, 0.45, 0.72);
const HAZE_NIGHT = new Color(0.04, 0.07, 0.15);
const HAZE_WARM = new Color(0.86, 0.6, 0.5);

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const wrap = (a: number) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

/**
 * Monta el aurero en `host`, un contenedor fijo detrás de la página que
 * contiene el <canvas>. Devuelve una función para desmontarlo.
 */
export function mount(host: HTMLElement, { clickArea, windows = [] }: MountOptions = {}): () => void {
  const canvas = host.querySelector('canvas');
  if (!canvas) return () => {};

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return () => {}; // sin WebGL queda el degradado CSS de fondo
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const camera = new PerspectiveCamera(50, 1, 0.1, 300);
  camera.rotation.order = 'YXZ';

  // ---- Cielo: se calcula en una textura pequeña y se escala ----
  const skyTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
  const skyMat = new ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    uniforms: {
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPhase: { value: 0 },
      uDay: { value: 1 },
      uWarm: { value: 0 },
      uNight: { value: 0 },
    },
    depthWrite: false,
    depthTest: false,
  });
  const quad = new PlaneGeometry(2, 2);
  const skyScene = new Scene();
  const skyMesh = new Mesh(quad, skyMat);
  skyMesh.frustumCulled = false;
  skyScene.add(skyMesh);

  const scene = new Scene();
  const blitMat = new ShaderMaterial({
    vertexShader: blitVertex,
    fragmentShader: blitFragment,
    uniforms: {
      tSky: { value: skyTarget.texture },
      uTime: { value: 0 },
      uNight: { value: 0 },
      uScroll: { value: 0 },
      uPx: { value: 1 },
    },
    depthWrite: false,
    depthTest: false,
  });
  const blit = new Mesh(quad, blitMat);
  blit.frustumCulled = false;
  blit.renderOrder = -1;
  scene.add(blit);

  // ---- Aves: pocas y lejanas ----
  const small = window.innerWidth < MOBILE_MAX_WIDTH;
  const preset = small ? BIRD_COUNTS.mobile : BIRD_COUNTS.desktop;
  const counts: Record<Species, number> = { 0: preset.gallinazos, 1: preset.auras };
  const haze = HAZE_DAY.clone();
  const meshes: InstancedMesh[] = [];
  const mats: ShaderMaterial[] = [];
  for (const sp of [0, 1] as Species[]) {
    const geo = birdGeometry(sp);
    const phases = new Float32Array(counts[sp]).map(() => Math.random() * Math.PI * 2);
    geo.setAttribute('aPhase', new InstancedBufferAttribute(phases, 1));
    const mat = new ShaderMaterial({
      vertexShader: birdVertex,
      fragmentShader: birdFragment,
      side: DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSpecies: { value: sp },
        uSpan: { value: SPANS[sp] },
        uHaze: { value: haze },
      },
    });
    const mesh = new InstancedMesh(geo, mat, counts[sp]);
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.frustumCulled = false;
    scene.add(mesh);
    meshes.push(mesh);
    mats.push(mat);
  }

  const thermals: Thermal[] = [
    { nx: 0.22, ny: 0.12, tnx: 0.22, tny: 0.12, dir: 1 },
    { nx: -0.58, ny: 0.52, tnx: -0.58, tny: 0.52, dir: -1 },
  ];

  const birds: Bird[] = [];
  for (const sp of [0, 1] as Species[]) {
    for (let i = 0; i < counts[sp]; i++) {
      const th = Math.random() < 0.7 ? 0 : 1;
      const ang = Math.random() * Math.PI * 2;
      birds.push({
        sp, i, th,
        z: th === 0 ? -rnd(38, 80) : -rnd(60, 95),
        r: rnd(2.6, 6.2),
        a: Math.random() * Math.PI * 2,
        dir: thermals[th].dir * (Math.random() < 0.85 ? 1 : -1),
        v: rnd(2.0, 2.6),
        phase: Math.random() * Math.PI * 2,
        s: sp ? 0.9 : 0.78,
        sx: Math.cos(ang) * 1.5, sy: Math.sin(ang) * 1.5,
        delay: Math.random() * 1.8,
        x: 0, y: 0, h: ang + Math.PI, bank: 0,
      });
    }
  }

  // ---- Tamaño ----
  let hh = 1, hw = 1;
  const drawSize = new Vector2();
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(drawSize);
    const sw = Math.max(1, Math.round(drawSize.x * SKY_SCALE));
    const sh = Math.max(1, Math.round(drawSize.y * SKY_SCALE));
    skyTarget.setSize(sw, sh);
    blitMat.uniforms.uPx.value = renderer.getPixelRatio();
    skyMat.uniforms.uRes.value.set(sw, sh);
    hh = Math.tan(MathUtils.degToRad(camera.fov / 2)) * REF_DEPTH;
    hw = hh * camera.aspect;
  };

  // ---- Scroll ----
  let scrollTarget = 0, scroll = 0;
  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };

  // ---- Interacción ----
  const pointer = { nx: 0, ny: 0 };
  const onMove = (e: PointerEvent) => {
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element).closest('a, button')) return;
    thermals[0].tnx = (e.clientX / window.innerWidth) * 2 - 1;
    thermals[0].tny = -((e.clientY / window.innerHeight) * 2 - 1);
    clickArea?.dispatchEvent(new CustomEvent('aurero:termica'));
    if (reduced) requestStill();
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  clickArea?.addEventListener('pointerdown', onDown);

  // ---- Simulación ----
  const dummy = new Object3D();
  dummy.rotation.order = 'ZYX';
  let t = 0;
  let followY = 0; // las aves siguen a la cámara con algo de retraso
  let presence = luz(hour()).birds; // 0 cuando el aurero se fue a dormir

  function step(dt: number) {
    t += dt;
    scroll += (scrollTarget - scroll) * Math.min(1, dt * 4);

    const L = luz(hour());
    presence += (L.birds - presence) * Math.min(1, dt * 0.6);
    const su = skyMat.uniforms;
    su.uPhase.value = L.phase;
    su.uDay.value = L.day;
    su.uWarm.value = L.warm;
    su.uNight.value = L.night;
    const camY = -scroll * SCROLL_TRAVEL;
    followY += (camY - followY) * Math.min(1, dt * 0.9);

    thermals.forEach((th, k) => {
      const pull = k === 0 ? 0.1 : 0;
      const f = Math.min(1, dt * 0.5);
      th.nx += (th.tnx + pointer.nx * pull - th.nx) * f;
      th.ny += (th.tny + pointer.ny * pull - th.ny) * f;
    });

    for (const b of birds) {
      const k = -b.z / REF_DEPTH;
      const th = thermals[b.th];
      const rr = b.r * Math.pow(k, 0.75);
      b.a += ((b.dir * b.v * Math.sqrt(k)) / rr) * dt;
      const cy = followY;
      const tx = th.nx * hw * k + Math.cos(b.a) * rr + Math.sin(t * 0.4 + b.phase) * 0.25 * k;
      const ty = cy + th.ny * hh * k + Math.sin(b.a) * rr + Math.cos(t * 0.33 + b.phase) * 0.25 * k;

      // Entrada: llegan planeando desde fuera de cuadro.
      // Si es de noche, `presence` baja a 0 y vuelven a salir de cuadro.
      const e = Math.min(1, Math.max(0, (t - b.delay) / 3.6));
      const ease = (1 - Math.pow(1 - e, 3)) * presence;
      const x = b.sx * hw * k + (tx - b.sx * hw * k) * ease;
      const y = cy + b.sy * hh * k + (ty - cy - b.sy * hh * k) * ease;

      const dx = x - b.x, dy = y - b.y;
      let turn = 0;
      if (dx * dx + dy * dy > 1e-8 && dt > 0) {
        const d = wrap(Math.atan2(dy, dx) - b.h) * Math.min(1, dt * 6);
        b.h = wrap(b.h + d);
        turn = d / dt;
      }
      const bankT = Math.max(-0.75, Math.min(0.75, turn * 0.45)) + b.sp * 0.16 * Math.sin(t * 1.8 + b.phase);
      b.bank += (bankT - b.bank) * Math.min(1, dt * 3);
      b.x = x; b.y = y;

      dummy.position.set(x, y, b.z);
      dummy.rotation.set(0, b.bank, b.h - Math.PI / 2);
      dummy.scale.setScalar(b.s);
      dummy.updateMatrix();
      meshes[b.sp].setMatrixAt(b.i, dummy.matrix);
    }
    for (const m of meshes) m.instanceMatrix.needsUpdate = true;
    for (const m of mats) m.uniforms.uTime.value = t;
    skyMat.uniforms.uTime.value = t;
    skyMat.uniforms.uScroll.value = scroll;
    blitMat.uniforms.uTime.value = t;
    blitMat.uniforms.uNight.value = L.night;
    blitMat.uniforms.uScroll.value = scroll;
    haze.copy(HAZE_DAY).lerp(HAZE_HIGH, scroll).lerp(HAZE_NIGHT, 1 - L.day).lerp(HAZE_WARM, L.warm * 0.5);

    const f = Math.min(1, dt * 2);
    camera.position.y = camY;
    camera.rotation.y += (-pointer.nx * 0.03 - camera.rotation.y) * f;
    camera.rotation.x += (pointer.ny * 0.02 - camera.rotation.x) * f;
  }

  let shown = false;
  function render() {
    renderer.setRenderTarget(skyTarget);
    renderer.render(skyScene, camera);
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    if (!shown) { shown = true; canvas!.classList.add('listo'); }
  }

  // ---- Bucle: se detiene con la pestaña oculta ----
  let raf = 0, last = 0;
  const frame = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    step(dt);
    render();
    raf = requestAnimationFrame(frame);
  };
  const seen = new Set<Element>();
  const skyVisible = () => windows.length === 0 || seen.size > 0;
  const start = () => {
    if (!raf && !document.hidden && !reduced && skyVisible()) { last = 0; raf = requestAnimationFrame(frame); }
  };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  // Con movimiento reducido: un cuadro quieto que se actualiza al hacer scroll.
  let stillQueued = false;
  function requestStill() {
    if (stillQueued) return;
    stillQueued = true;
    requestAnimationFrame(() => {
      stillQueued = false;
      scroll = scrollTarget;
      followY = -scroll * SCROLL_TRAVEL;
      step(0);
      render();
    });
  }

  const onScroll = () => { readScroll(); if (reduced) requestStill(); };
  const onVisibility = () => (document.hidden ? stop() : start());
  const onResize = () => { resize(); readScroll(); if (reduced) requestStill(); };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibility);

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
    skyVisible() ? start() : stop();
  });
  for (const w of windows) if (w) io.observe(w);

  resize();
  readScroll();
  scroll = scrollTarget;
  followY = -scroll * SCROLL_TRAVEL;
  let stillTimer = 0;
  if (reduced) {
    for (let s = 0; s < 360; s++) step(1 / 60); // las aves ya en el remolino
    render();
    stillTimer = window.setInterval(requestStill, 1000); // el cielo sigue la hora, sin animar
  } else {
    start();
  }

  return () => {
    stop();
    io.disconnect();
    window.clearInterval(stillTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', onVisibility);
    clickArea?.removeEventListener('pointerdown', onDown);
    skyTarget.dispose();
    renderer.dispose();
  };
}
