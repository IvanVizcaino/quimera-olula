/** Posición de un elemento en una rejilla de columnas fijas y filas de alto fijo. */
export type ElementoRejilla = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export const COLUMNAS_REJILLA = 12;

const solapan = (a: ElementoRejilla, b: ElementoRejilla): boolean =>
  a.id !== b.id &&
  a.x < b.x + b.w &&
  b.x < a.x + a.w &&
  a.y < b.y + b.h &&
  b.y < a.y + a.h;

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.min(Math.max(valor, minimo), maximo);

/** Dentro de la rejilla: ancho de 1 a 12, sin salirse por la derecha, alto ≥ 1. */
export const ajustarElemento = <T extends ElementoRejilla>(
  elemento: T,
  columnas = COLUMNAS_REJILLA
): T => {
  const w = limitar(Math.round(elemento.w), 1, columnas);
  return {
    ...elemento,
    w,
    x: limitar(Math.round(elemento.x), 0, columnas - w),
    y: Math.max(0, Math.round(elemento.y)),
    h: Math.max(1, Math.round(elemento.h)),
  };
};

const porPosicion = (a: ElementoRejilla, b: ElementoRejilla) =>
  a.y - b.y || a.x - b.x;

/**
 * Sin solapes y «con gravedad»: cada elemento sube hasta el primer hueco libre, en
 * orden de arriba abajo. `fijo` (el que el usuario acaba de mover o redimensionar) se
 * coloca primero donde está y los demás se recolocan a su alrededor.
 */
export const compactar = <T extends ElementoRejilla>(
  elementos: T[],
  fijo?: string
): T[] => {
  const colocados: T[] = [];
  const elFijo = elementos.find((e) => e.id === fijo);
  if (elFijo) colocados.push(elFijo);

  [...elementos]
    .filter((e) => e.id !== fijo)
    .sort(porPosicion)
    .forEach((elemento) => {
      let candidato = { ...elemento, y: 0 };
      while (colocados.some((c) => solapan(c, candidato))) {
        candidato = { ...candidato, y: candidato.y + 1 };
      }
      colocados.push(candidato);
    });

  // Mismo orden de entrada: el llamador no ve cambiar el orden de su lista.
  const porId = new Map(colocados.map((e) => [e.id, e]));
  return elementos.map((e) => porId.get(e.id) as T);
};

const recolocar = <T extends ElementoRejilla>(
  elementos: T[],
  id: string,
  cambio: (e: T) => T
): T[] => {
  const cambiados = elementos.map((e) =>
    e.id === id ? ajustarElemento(cambio(e)) : e
  );
  // Primero se abre sitio alrededor del cambiado y después todo sube a su hueco.
  return compactar(compactar(cambiados, id));
};

export const moverElemento = <T extends ElementoRejilla>(
  elementos: T[],
  id: string,
  x: number,
  y: number
): T[] => recolocar(elementos, id, (e) => ({ ...e, x, y }));

export const redimensionarElemento = <T extends ElementoRejilla>(
  elementos: T[],
  id: string,
  w: number,
  h: number
): T[] => recolocar(elementos, id, (e) => ({ ...e, w, h }));

/** Primer hueco (de arriba abajo, de izquierda a derecha) donde cabe un w × h. */
export const posicionLibre = (
  elementos: ElementoRejilla[],
  w: number,
  h: number,
  columnas = COLUMNAS_REJILLA
): { x: number; y: number } => {
  const ancho = limitar(w, 1, columnas);
  for (let y = 0; ; y++) {
    for (let x = 0; x <= columnas - ancho; x++) {
      const candidato = { id: "\u0000", x, y, w: ancho, h };
      if (!elementos.some((e) => solapan(e, candidato))) return { x, y };
    }
  }
};

/** Celdas que supone un desplazamiento en píxeles (lo que se ha arrastrado). */
export const celdasDesplazadas = (
  pixeles: number,
  tamañoCelda: number,
  separacion: number
): number => Math.round(pixeles / (tamañoCelda + separacion));

/** Orden de lectura (y, x): el de la versión de una columna en el móvil. */
export const ordenLectura = <T extends ElementoRejilla>(elementos: T[]): T[] =>
  [...elementos].sort(porPosicion);
