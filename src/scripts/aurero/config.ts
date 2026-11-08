/** Cuántas aves hay en el aurero. Lo usan la escena y la bitácora de la portada. */
export const BIRD_COUNTS = {
  desktop: { gallinazos: 6, auras: 3 },
  mobile: { gallinazos: 4, auras: 2 },
} as const;

/** Por debajo de este ancho se usa la versión ligera. */
export const MOBILE_MAX_WIDTH = 700;
