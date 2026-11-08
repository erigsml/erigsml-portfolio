/**
 * Reloj del sitio: la hora local de quien visita mueve el sol, la luna,
 * los colores del cielo y el tema de la página.
 *
 * En Ecuador el día dura ~12 h todo el año, así que el sol sale a las 6:00
 * y se pone a las 18:00. Con ?hora=19.5 en la URL se puede fijar una hora.
 * El modo time-lapse recorre un día completo en LAPSE_SECONDS segundos.
 */

export type Tiempo = 'amanecer' | 'dia' | 'atardecer' | 'noche';

export const LAPSE_SECONDS = 48;

let lapse = false;
let lapseFrom = 0;
let lapseStart = 0;
const listeners = new Set<() => void>();

const fixed = (() => {
  if (typeof location === 'undefined') return null;
  const v = parseFloat(new URLSearchParams(location.search).get('hora') ?? '');
  return Number.isFinite(v) ? ((v % 24) + 24) % 24 : null;
})();

/** Hora actual en horas decimales (0–24). */
export function hour(): number {
  if (lapse) return (lapseFrom + ((performance.now() - lapseStart) / 1000) * (24 / LAPSE_SECONDS)) % 24;
  if (fixed !== null) return fixed;
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}

export function isLapse(): boolean {
  return lapse;
}

export function toggleLapse(): void {
  const h = hour();
  lapse = !lapse;
  lapseFrom = h;
  lapseStart = performance.now();
  listeners.forEach((fn) => fn());
}

export function onLapseChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface Luz {
  /** Ángulo del sol en su recorrido: 0 al salir, π/2 a mediodía, π al ponerse. */
  phase: number;
  /** Altura del sol: 1 a mediodía, 0 en el horizonte, negativa de noche. */
  elev: number;
  /** 1 de día, 0 de noche. */
  day: number;
  /** Cuánto tono de amanecer o atardecer hay (0–1). */
  warm: number;
  /** 1 en plena noche. */
  night: number;
  /** Los gallinazos vuelan con las térmicas: 1 a media mañana y tarde, 0 de noche. */
  birds: number;
}

export function luz(h: number): Luz {
  const phase = ((h - 6) / 12) * Math.PI;
  const elev = Math.sin(phase);
  return {
    phase,
    elev,
    day: smooth(-0.12, 0.22, elev),
    warm: Math.exp(-(((elev - 0.02) / 0.16) ** 2)),
    night: 1 - smooth(-0.3, -0.02, elev),
    birds: smooth(0.3, 0.55, elev),
  };
}

export function tiempo(h: number): Tiempo {
  if (h >= 5.5 && h < 7) return 'amanecer';
  if (h >= 7 && h < 17) return 'dia';
  if (h >= 17 && h < 18.75) return 'atardecer';
  return 'noche';
}
