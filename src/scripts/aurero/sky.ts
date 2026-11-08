/**
 * Cielo visto desde abajo, calculado a resolución reducida (las nubes son
 * suaves, así que escalar no se nota) y luego dibujado a pantalla completa.
 *
 * - uPhase/uDay/uWarm/uNight vienen del reloj (scripts/reloj.ts): el sol y la
 *   luna cruzan el cielo, hay tonos de amanecer y atardecer, y de noche
 *   aparecen las estrellas.
 * - uScroll (0..1): al bajar, las nubes se desplazan y el azul se hace más
 *   profundo, como si miraras hacia el cenit.
 */
export const skyVertex = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const skyFragment = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uPhase;
uniform float uDay;
uniform float uWarm;
uniform float uNight;

const float PI = 3.14159265;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);

float fbm4(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = ROT * p; a *= 0.5; }
  return v;
}

float fbm6(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { v += a * noise(p); p = ROT * p; a *= 0.5; }
  return v;
}

// Recorrido de un astro por la pantalla: sale por la izquierda, culmina arriba
// y se pone por la derecha. En pantallas verticales va más arriba, lejos del texto.
vec2 arco(float ph, float asp) {
  float baseY = mix(0.36, 0.12, step(1.0, asp));
  return vec2(-cos(ph) * 0.8 * asp, baseY + 0.22 * sin(ph));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float asp = uRes.x / uRes.y;
  float s = uScroll;
  vec2 lift = vec2(0.0, s * 1.8); // el cielo "sube" al bajar por la página

  vec2 sun = arco(uPhase, asp) + lift;
  vec2 moon = arco(uPhase + PI, asp) + lift;
  float sunUp = smoothstep(-0.15, 0.05, sin(uPhase));
  float moonUp = smoothstep(-0.15, 0.05, -sin(uPhase));
  float ds = length(p - sun);
  float dm = length(p - moon);

  // ---- Nubes: fbm con deformación de dominio ----
  vec2 q = p * 1.5 + vec2(uTime * 0.008, uTime * 0.003 - s * 1.1);
  vec2 warp = vec2(fbm4(q * 1.3 + uTime * 0.005), fbm4(q * 1.3 + 7.3 - uTime * 0.004));
  vec2 qw = q + 0.85 * warp;
  float w = fbm6(qw);

  float edge  = smoothstep(0.2, 1.0, length(p * vec2(0.8, 1.1)));
  float top   = smoothstep(-0.1, 0.5, p.y);
  float clear = 1.0 - smoothstep(0.12, 0.55, length(p * vec2(0.7, 1.0))); // claro al centro, tras el texto
  float cover = 0.30 + 0.36 * edge - 0.10 * top - 0.40 * clear - 0.55 * smoothstep(0.02, 0.22, s);
  float lo = 0.60 - cover * 0.55;
  float d = smoothstep(lo, lo + 0.22, w);
  float inner = smoothstep(lo + 0.12, lo + 0.40, w);

  // Autosombra hacia la fuente de luz (el sol de día, la luna de noche).
  vec2 light = mix(moon, sun, step(0.5, uDay + uWarm * 0.5));
  float d2 = smoothstep(lo, lo + 0.22, fbm4(qw + normalize(light - p) * 0.10) + 0.06);

  // ---- Colores del cielo según la hora ----
  vec3 zenith  = mix(vec3(0.08, 0.27, 0.66), vec3(0.05, 0.17, 0.45), s);
  vec3 horizon = mix(vec3(0.47, 0.66, 0.92), vec3(0.22, 0.40, 0.72), s);
  zenith  = mix(vec3(0.010, 0.022, 0.065), zenith, uDay);
  horizon = mix(vec3(0.035, 0.060, 0.140), horizon, uDay);
  horizon = mix(horizon, vec3(0.98, 0.56, 0.34), uWarm * 0.85);
  zenith  = mix(zenith, vec3(0.20, 0.22, 0.48), uWarm * 0.5);

  float r = length(p - vec2(0.15, -0.1));
  vec3 sky = mix(zenith, horizon, smoothstep(0.15, 1.2, r));
  vec3 sunHaze = mix(vec3(0.70, 0.83, 0.97), vec3(1.0, 0.74, 0.50), uWarm);
  sky = mix(sky, sunHaze, exp(-ds * 2.0) * 0.75 * (1.0 - s * 0.6) * sunUp * max(uDay, uWarm));

  // ---- Vía Láctea: una franja de polvo luminoso muy tenue, solo de noche ----
  // (las estrellas se dibujan después, a resolución completa, en blitFragment)
  vec2 mw = p - lift * 0.5;
  float across = dot(mw, normalize(vec2(-0.55, 0.85)));
  float band = exp(-pow(across / 0.20, 2.0));
  float dust = fbm4(mw * 3.2 + 11.0);
  float lane = smoothstep(0.35, 0.65, fbm4(mw * 6.0 - 3.0)); // franjas oscuras de polvo
  sky += vec3(0.13, 0.13, 0.18) * band * (0.35 + dust) * (0.55 + 0.45 * lane) * uNight;

  // ---- Nubes iluminadas según la hora ----
  vec3 lit = mix(vec3(0.30, 0.34, 0.45), vec3(1.0, 0.985, 0.96), uDay);
  lit = mix(lit, vec3(1.0, 0.70, 0.52), uWarm * 0.8);
  vec3 shade = mix(vec3(0.06, 0.07, 0.12), vec3(0.55, 0.61, 0.72), uDay);
  shade = mix(shade, vec3(0.42, 0.30, 0.42), uWarm * 0.7);
  vec3 cloud = mix(lit, shade, clamp(0.65 * d2 + 0.35 * inner - 0.25, 0.0, 1.0));

  float rim = d * (1.0 - d) * 4.0;
  vec3 sunCol = mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.62, 0.36), uWarm);
  cloud += sunCol * rim * exp(-ds * 2.0) * 0.8 * sunUp * max(uDay, uWarm);
  cloud = mix(cloud, vec3(1.0), exp(-ds * 2.6) * 0.6 * sunUp * uDay);
  cloud += vec3(0.6, 0.7, 0.9) * rim * exp(-dm * 2.5) * 0.35 * moonUp * uNight;

  vec3 col = mix(sky, cloud, d);

  // ---- Sol ----
  float sunVis = (1.0 - d * 0.85) * sunUp;
  col += sunCol * (exp(-ds * 3.6) * 0.30 + exp(-ds * 26.0) * 0.9 + (1.0 - smoothstep(0.012, 0.024, ds))) * sunVis;
  float ang = atan(p.y - sun.y, p.x - sun.x);
  float rays = pow(max(0.0, sin(ang * 13.0 + uTime * 0.03)), 8.0) * 0.5
             + pow(max(0.0, sin(ang * 7.0 - uTime * 0.02)), 10.0) * 0.5;
  col += vec3(0.9, 0.95, 1.0) * 0.06 * rays * exp(-ds * 1.3) * (1.0 - d * 0.8) * sunUp * uDay;

  // ---- Luna ----
  float moonVis = (1.0 - d * 0.7) * moonUp * uNight;
  float disk = 1.0 - smoothstep(0.0165, 0.0185, dm);
  float maria = 0.78 + 0.22 * smoothstep(0.35, 0.65, fbm4((p - moon) * 120.0 + 4.0)); // mares lunares
  col = mix(col, vec3(0.93, 0.94, 0.97) * maria, disk * moonVis);
  col += vec3(0.75, 0.82, 1.0) * (exp(-dm * 14.0) * 0.12 + exp(-dm * 4.0) * 0.05) * moonVis;

  // Al final de la página, de día, la luz se entibia un poco.
  col = mix(col, col * vec3(1.06, 0.97, 0.88), smoothstep(0.7, 1.0, s) * 0.6 * uDay);

  col *= 1.0 - 0.12 * length(uv - 0.5);
  // El alfa guarda cuánto cielo despejado hay: las estrellas solo se ven ahí.
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0 - d);
}
`;

/**
 * Dibuja la textura del cielo a pantalla completa y, encima, las estrellas
 * a resolución nativa: puntos diminutos de borde suave, muchos tenues y
 * pocos brillantes, con un leve tinte azul o cálido, como en una foto larga.
 */
export const blitVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`;

export const blitFragment = /* glsl */ `
precision highp float;
uniform sampler2D tSky;
uniform float uTime;
uniform float uNight;
uniform float uScroll;
uniform float uPx; // píxeles físicos por píxel CSS, para que las estrellas midan lo mismo en toda pantalla
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// Una capa de estrellas: como mucho una por celda, en posición aleatoria.
vec3 stars(vec2 px, float cell, float prob, float gain, float sigma, float seed) {
  vec2 c = floor(px / cell);
  float h = hash(c + seed);
  if (h > prob) return vec3(0.0);
  vec2 pos = (vec2(hash(c + seed + 3.1), hash(c + seed + 7.7)) * 0.8 + 0.1) * cell;
  vec2 f = px - c * cell - pos;
  float b = pow(hash(c + seed + 1.3), 5.0) * gain;            // casi todas tenues
  float tw = 0.88 + 0.12 * sin(uTime * (1.2 + h * 2.5) + h * 60.0); // titileo leve
  vec3 tint = mix(vec3(0.78, 0.86, 1.0), vec3(1.0, 0.9, 0.78), hash(c + seed + 5.9));
  float core = exp(-dot(f, f) / (2.0 * sigma * sigma));
  return tint * b * tw * core;
}

void main() {
  vec4 sky = texture2D(tSky, vUv);
  vec3 c = sky.rgb;

  if (uNight > 0.01) {
    vec2 px = (gl_FragCoord.xy + vec2(0.0, uScroll * 600.0 * uPx)) / uPx;
    vec3 st = stars(px, 5.0, 0.30, 0.9, 0.45, 0.0)
            + stars(px + 37.0, 14.0, 0.45, 1.6, 0.55, 19.0)
            + stars(px + 91.0, 46.0, 0.55, 3.2, 0.70, 41.0);
    c += st * uNight * sky.a;
  }

  float g = hash(gl_FragCoord.xy + floor(uTime * 12.0) * 17.0) - 0.5;
  c += g * 0.018;
  gl_FragColor = vec4(c, 1.0);
}
`;
