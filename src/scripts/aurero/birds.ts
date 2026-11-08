import { Shape, ShapeGeometry } from 'three';

/** 0 = gallinazo (Coragyps atratus), 1 = aura (Cathartes aura). */
export type Species = 0 | 1;

/**
 * Silueta vista desde abajo, en el plano XY, con la cabeza hacia +Y.
 * Envergadura de -span a +span. Los "dedos" son las primarias abiertas.
 */
export function birdGeometry(species: Species): ShapeGeometry {
  const tail = species ? 0.27 : 0.14; // el aura tiene la cola más larga
  const chord = species ? 0.02 : 0.06; // el gallinazo tiene alas más anchas
  const span = SPANS[species];

  const right: [number, number][] = [
    [0, 0.36], [0.035, 0.335], [0.05, 0.28], [0.07, 0.17],
    // borde de ataque
    [0.25, 0.17], [0.5, 0.155], [0.72, 0.125], [0.83, 0.105],
    // primarias separadas
    [0.97, 0.09], [0.885, 0.06], [1, 0.035], [0.89, 0.01], [0.99, -0.025],
    [0.885, -0.045], [0.95, -0.085], [0.85, -0.09], [0.875, -0.135], [0.78, -0.125],
    // borde de fuga
    [0.62, -0.1 - chord], [0.42, -0.13 - chord], [0.25, -0.14 - chord], [0.12, -0.12 - chord * 0.8],
    // cola
    [0.075, -0.17], [0.08, -0.17 - tail], [0.03, -0.19 - tail], [0, -0.185 - tail],
  ];
  const left = right.slice(1, -1).reverse().map(([x, y]) => [-x, y] as [number, number]);
  const pts = right.concat(left);

  const s = new Shape();
  s.moveTo(pts[0][0] * span, pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0] * span, pts[i][1]);
  return new ShapeGeometry(s);
}

export const SPANS: Record<Species, number> = { 0: 1.0, 1: 1.14 };

export const birdVertex = /* glsl */ `
attribute float aPhase;
uniform float uTime;
uniform float uSpecies;
uniform float uSpan;
varying vec2 vPos;
varying float vDepth;

void main() {
  vec3 pos = position;
  vPos = vec2(position.x / uSpan, position.y);
  float ax = abs(vPos.x);

  // Diedro: el aura planea con las alas en V marcada.
  pos.z += ax * ax * mix(0.08, 0.30, uSpecies);

  // El gallinazo aletea de vez en cuando; el aura casi nunca.
  float env = smoothstep(0.93, 1.0, sin(uTime * 0.45 + aPhase * 5.0)) * (1.0 - uSpecies);
  float fl = sin(uTime * 13.0 + aPhase);
  pos.z += fl * 0.34 * ax * env;
  pos.x *= 1.0 - 0.12 * env * abs(fl);

  vec4 mv = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const birdFragment = /* glsl */ `
precision highp float;
uniform float uSpecies;
uniform vec3 uHaze;
varying vec2 vPos;
varying float vDepth;

void main() {
  float ax = abs(vPos.x);
  vec3 col = vec3(0.07, 0.06, 0.055);

  // Gallinazo: parche blanquecino en las primarias.
  float tip = smoothstep(0.64, 0.72, ax) * (1.0 - smoothstep(0.90, 0.99, ax) * 0.45);
  col = mix(col, vec3(0.84, 0.83, 0.80), tip * 0.85 * (1.0 - uSpecies));

  // Aura: plumas de vuelo plateadas en la mitad de atrás del ala.
  float lead = 0.15 - 0.05 * ax;
  float trailing = 1.0 - smoothstep(lead - 0.15, lead - 0.08, vPos.y);
  col = mix(col, vec3(0.60, 0.60, 0.62), trailing * 0.72 * uSpecies * smoothstep(0.08, 0.14, ax));

  // Cabeza: gris en el gallinazo, roja en el aura.
  float head = smoothstep(0.27, 0.31, vPos.y);
  col = mix(col, mix(vec3(0.36, 0.35, 0.34), vec3(0.64, 0.17, 0.13), uSpecies), head);

  // Bruma: mientras más lejos, más se funde con el cielo.
  float haze = clamp((vDepth - 20.0) / 90.0, 0.0, 0.7);
  col = mix(col, uHaze, haze);

  gl_FragColor = vec4(col, 1.0);
}
`;
