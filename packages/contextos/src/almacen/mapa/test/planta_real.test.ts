import { describe, expect, it } from "vitest";
import { MapaAlmacen, PasilloEnPlanta, PasilloMapa, PlantaAlmacen } from "../diseño.ts";
import {
    ajustarARejilla, avisosPlanta, colocarPasillo, geometriaEnPlanta, girarPasillo, medidasEfectivas,
    MEDIDAS_PLANTA_POR_DEFECTO, metrosPositivos, moverPieza, pasillosSinColocar, plantaInicial, puntoEnPlanta,
    tamanoPasillo,
} from "../dominio.ts";
import { plantaAApi, plantaDesdeApi } from "../infraestructura.ts";

// Medidas redondas para que las cuentas se lean: módulo 2, fondo 1, pasillo 3.
const M = { largoModulo: 2, fondo: 1, anchoPasillo: 3 };

const pasillo = (id: string, extra: Partial<PasilloMapa> = {}): PasilloMapa => ({
    pasilloId: id, pasillo: id, orden: 1, caras: "AMBAS", modulos: 4, accesos: "AMBOS_EXTREMOS", niveles: 1, ...extra,
});

const mapa: Pick<MapaAlmacen, "zonas"> = {
    zonas: [
        { zonaId: "Z1", zona: "APQ", funcion: "RESERVA", pasillos: [pasillo("A"), pasillo("B", { caras: "IZQUIERDA" })] },
        { zonaId: "Z2", zona: "PIC", funcion: "PICKING", pasillos: [pasillo("C", { caras: "DERECHA", modulos: 2 })] },
    ],
};

const colocado = (pasilloId: string, x: number, y: number, giro: PasilloEnPlanta["giro"] = 0): PasilloEnPlanta =>
    ({ pasilloId, x, y, giro, medidas: {} });

const planta = (pasillos: PasilloEnPlanta[] = [], extra: Partial<PlantaAlmacen> = {}): PlantaAlmacen => ({
    ancho: 30, largo: 20, medidas: M, pasillos, elementos: [], ...extra,
});

describe("geometría de la planta real", () => {
    it("tamaño según caras, módulos y giro", () => {
        expect(tamanoPasillo(pasillo("A"), M, 0)).toEqual({ ancho: 5, largo: 8 });
        expect(tamanoPasillo(pasillo("A"), M, 90)).toEqual({ ancho: 8, largo: 5 });
        expect(tamanoPasillo(pasillo("B", { caras: "IZQUIERDA" }), M, 180)).toEqual({ ancho: 4, largo: 8 });
    });

    it("las medidas propias sustituyen a las de la planta", () => {
        expect(medidasEfectivas(M, { fondo: 1.2 })).toEqual({ ...M, fondo: 1.2 });
    });

    it("sin girar: impares a la izquierda, pares a la derecha, módulo 1 arriba", () => {
        const g = geometriaEnPlanta(pasillo("A"), colocado("A", 10, 2), M);
        expect({ x: g.x, y: g.y, ancho: g.ancho, largo: g.largo }).toEqual({ x: 10, y: 2, ancho: 5, largo: 8 });
        const celda = (m: number) => g.celdas.find((c) => c.modulo === m);
        expect(celda(1)).toMatchObject({ x: 10, y: 2, ancho: 1, largo: 2 });
        expect(celda(2)).toMatchObject({ x: 14, y: 2 });
        expect(celda(7)).toMatchObject({ x: 10, y: 8 });
        expect(g.suelo).toEqual({ x: 11, y: 2, ancho: 3, largo: 8 });
    });

    it("girado 90°: el avance va de derecha a izquierda y el rectángulo cabe en (x, y)", () => {
        const g = geometriaEnPlanta(pasillo("A"), colocado("A", 0, 0, 90), M);
        expect({ x: g.x, y: g.y, ancho: g.ancho, largo: g.largo }).toEqual({ x: 0, y: 0, ancho: 8, largo: 5 });
        // Módulo 1 (izquierda según el avance) arriba a la derecha.
        expect(g.celdas.find((c) => c.modulo === 1)).toMatchObject({ x: 6, y: 0, ancho: 2, largo: 1 });
        expect(g.celdas.find((c) => c.modulo === 2)).toMatchObject({ x: 6, y: 4 });
    });

    it("girado 180°: módulo 1 abajo a la derecha", () => {
        const g = geometriaEnPlanta(pasillo("A"), colocado("A", 0, 0, 180), M);
        expect(g.celdas.find((c) => c.modulo === 1)).toMatchObject({ x: 4, y: 6 });
    });

    it("una cara a la derecha: el suelo empieza en el borde", () => {
        const g = geometriaEnPlanta(pasillo("C", { caras: "DERECHA", modulos: 2 }), colocado("C", 0, 0), M);
        expect(g.suelo).toMatchObject({ x: 0, ancho: 3 });
        expect(g.celdas.map((c) => c.modulo)).toEqual([2, 4]);
        expect(g.celdas[0]).toMatchObject({ x: 3, ancho: 1 });
    });

    it("la parada cae en el eje del pasillo, a la altura del módulo", () => {
        expect(puntoEnPlanta(pasillo("A"), colocado("A", 10, 2), M, 3)).toEqual({ x: 12.5, y: 5 });
        expect(puntoEnPlanta(pasillo("A"), colocado("A", 0, 0, 90), M, 1)).toEqual({ x: 7, y: 2.5 });
    });
});

describe("edición de la planta", () => {
    it("propuesta inicial: cada zona en fila, con la nave alrededor", () => {
        const p = plantaInicial(mapa);
        expect(p.medidas).toEqual(MEDIDAS_PLANTA_POR_DEFECTO);
        expect(p.pasillos.map((c) => c.pasilloId)).toEqual(["A", "B", "C"]);
        expect(p.pasillos.every((c) => c.y === 2 && c.giro === 0)).toBe(true);
        expect(avisosPlanta(mapa, p)).toEqual([]);
    });

    it("pasillos sin colocar y colocar en un hueco libre", () => {
        const p = planta([colocado("A", 0, 0)]);
        expect(pasillosSinColocar(mapa, p).map((x) => x.pasilloId)).toEqual(["B", "C"]);
        const con = colocarPasillo(mapa, p, pasillo("B", { caras: "IZQUIERDA" }));
        expect(con.pasillos[1]).toMatchObject({ pasilloId: "B", x: 5, y: 0 });
    });

    it("mover encaja a la rejilla y no deja salir de la nave", () => {
        const p = planta([colocado("A", 0, 0)]);
        expect(moverPieza(mapa, p, { tipo: "PASILLO", pasilloId: "A" }, 3.26, 4.8).pasillos[0]).toMatchObject({ x: 3.5, y: 5 });
        expect(moverPieza(mapa, p, { tipo: "PASILLO", pasilloId: "A" }, 40, -3).pasillos[0]).toMatchObject({ x: 25, y: 0 });
        expect(ajustarARejilla(1.24)).toBe(1);
    });

    it("girar sobre el centro y dentro de la nave", () => {
        const p = planta([colocado("A", 10, 4)]);
        const girada = girarPasillo(mapa, p, "A").pasillos[0];
        // 5 × 8 → 8 × 5 con el mismo centro (12,5; 8).
        expect(girada).toMatchObject({ giro: 90, x: 8.5, y: 5.5 });
        expect(girarPasillo(mapa, planta([colocado("A", 0, 0, 270)]), "A").pasillos[0].giro).toBe(0);
    });

    it("avisa de solapes y de piezas fuera de la nave", () => {
        const p = planta([colocado("A", 0, 0), colocado("B", 3, 0)], {
            elementos: [{ tipo: "MUELLE", nombre: "Muelle 1", x: 28, y: 0, ancho: 4, largo: 3 }],
        });
        expect(avisosPlanta(mapa, p)).toEqual([
            "Muelle 1 se sale de la nave",
            "Pasillo APQ-A se solapa con Pasillo APQ-B",
        ]);
    });

    it("metros: positivos con coma o punto", () => {
        expect(metrosPositivos("2,5")).toBe(2.5);
        expect(metrosPositivos("0")).toBeNull();
        expect(metrosPositivos("abc")).toBeNull();
    });

    it("ida y vuelta con la API: las medidas propias vacías son null", () => {
        const p = planta([{ ...colocado("A", 1, 2, 90), medidas: { fondo: 1.2 } }]);
        const api = plantaAApi(p);
        expect(api.pasillos[0].medidas).toEqual({ largo_modulo: null, fondo: 1.2, ancho_pasillo: null });
        expect(plantaDesdeApi(api)).toEqual(p);
        expect(plantaDesdeApi(null)).toBeNull();
    });
});
