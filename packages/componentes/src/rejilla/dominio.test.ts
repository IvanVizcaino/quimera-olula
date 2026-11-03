import {
  ajustarElemento,
  celdasDesplazadas,
  compactar,
  ElementoRejilla,
  moverElemento,
  ordenLectura,
  posicionLibre,
  redimensionarElemento,
} from "./dominio.ts";

const e = (id: string, x: number, y: number, w: number, h: number): ElementoRejilla => ({
  id,
  x,
  y,
  w,
  h,
});

const posiciones = (elementos: ElementoRejilla[]) =>
  Object.fromEntries(elementos.map(({ id, x, y, w, h }) => [id, [x, y, w, h]]));

describe("rejilla", () => {
  test("ajusta a la rejilla: ancho 1-12, sin salirse por la derecha", () => {
    expect(ajustarElemento(e("a", 10, -2, 5, 0))).toEqual(e("a", 7, 0, 5, 1));
    expect(ajustarElemento(e("a", 2.4, 1.6, 20, 2))).toEqual(e("a", 0, 2, 12, 2));
  });

  test("compactar sube cada elemento al primer hueco, sin solapes", () => {
    const resultado = compactar([e("a", 0, 3, 6, 2), e("b", 6, 5, 6, 2), e("c", 0, 9, 12, 1)]);
    expect(posiciones(resultado)).toEqual({
      a: [0, 0, 6, 2],
      b: [6, 0, 6, 2],
      c: [0, 2, 12, 1],
    });
  });

  test("compactar conserva el orden de la lista", () => {
    const resultado = compactar([e("b", 0, 4, 4, 1), e("a", 0, 0, 4, 1)]);
    expect(resultado.map((x) => x.id)).toEqual(["b", "a"]);
  });

  test("mover encima de otro lo empuja hacia abajo", () => {
    const inicial = [e("a", 0, 0, 6, 2), e("b", 6, 0, 6, 2)];
    const resultado = moverElemento(inicial, "b", 0, 0);
    expect(posiciones(resultado)).toEqual({ b: [0, 0, 6, 2], a: [0, 2, 6, 2] });
  });

  test("mover al final de la rejilla deja a los demás arriba", () => {
    const inicial = [e("a", 0, 0, 12, 2), e("b", 0, 2, 12, 2), e("c", 0, 4, 12, 2)];
    const resultado = moverElemento(inicial, "a", 0, 10);
    expect(ordenLectura(resultado).map((x) => x.id)).toEqual(["b", "c", "a"]);
    expect(posiciones(resultado).a).toEqual([0, 4, 12, 2]);
  });

  test("redimensionar empuja a los que solapa", () => {
    const inicial = [e("a", 0, 0, 4, 2), e("b", 4, 0, 4, 2), e("c", 0, 2, 4, 2)];
    const resultado = redimensionarElemento(inicial, "a", 8, 3);
    expect(posiciones(resultado)).toEqual({
      a: [0, 0, 8, 3],
      // Cada uno baja en su columna.
      b: [4, 3, 4, 2],
      c: [0, 3, 4, 2],
    });
  });

  test("posición libre: primer hueco donde cabe", () => {
    const elementos = [e("a", 0, 0, 8, 2), e("b", 0, 2, 12, 1)];
    expect(posicionLibre(elementos, 4, 2)).toEqual({ x: 8, y: 0 });
    expect(posicionLibre(elementos, 6, 1)).toEqual({ x: 0, y: 3 });
    expect(posicionLibre([], 3, 2)).toEqual({ x: 0, y: 0 });
  });

  test("celdas desplazadas al arrastrar", () => {
    expect(celdasDesplazadas(250, 80, 16)).toBe(3);
    expect(celdasDesplazadas(-40, 80, 16)).toBe(-0);
    expect(celdasDesplazadas(-60, 80, 16)).toBe(-1);
  });
});
