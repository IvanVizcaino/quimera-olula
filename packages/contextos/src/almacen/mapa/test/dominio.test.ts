import { describe, expect, it } from "vitest";
import { RecorridoOrden } from "#/almacen/orden/diseño.ts";
import { MapaAlmacen, PasilloMapa, UbicacionMapa } from "../diseño.ts";
import {
    geometriaPasillo, huecosDe, letraModulo, letraUbicacion, listaCorta, ladoDeModulo, leyenda, mejorClase, modulosDeLado, paletaClases,
    paradasSinPasillo, posicionEnPasillo, puntosRecorrido, tonoModulo, tonoSlotting, tonoUbicacion,
    trazoRecorrido, ubicacionesSueltas, MEDIDAS,
} from "../dominio.ts";

const pasillo = (id: string, extra: Partial<PasilloMapa> = {}): PasilloMapa => ({
    pasilloId: id, pasillo: id, orden: 1, caras: "AMBAS", modulos: 4, accesos: "AMBOS_EXTREMOS",
    niveles: 2, ...extra,
});

const ubi = (id: string, extra: Partial<UbicacionMapa> = {}): UbicacionMapa => ({
    ubicacionId: id, ubicacion: `U${id}`, zonaId: "Z", pasilloId: "P1", modulo: 1, nivel: 0, hueco: 1,
    formato: "HUECO_PALET", bloqueada: false, cantidad: 0, articulos: [], claseArticulo: null,
    clasesAlmacenamiento: [], accesibilidad: 1, claseUbicacion: "A", metrosSalida: null, metrosEntrada: null,
    pickingFijo: null, ...extra,
});

const mapa = (ubicaciones: UbicacionMapa[]): MapaAlmacen => ({
    zonas: [{
        zonaId: "Z", zona: "PIC", funcion: "PICKING", pasillos: [pasillo("P1"), pasillo("P2")],
        accesibilidad: { calculo: "FORMULA", motivo: "SIN_PLANTA", pasillosSinColocar: [] },
    }],
    ubicaciones,
    planta: null,
});

const SIN = new Map<string, number>();

describe("mapa · layout", () => {
    it("impares a la izquierda, pares a la derecha, enfrentados", () => {
        expect(ladoDeModulo(1)).toBe("IZQUIERDA");
        expect(ladoDeModulo(2)).toBe("DERECHA");
        expect(posicionEnPasillo(3)).toBe(2);
        expect(posicionEnPasillo(4)).toBe(2);
        expect(modulosDeLado(pasillo("P"), "DERECHA")).toEqual([2, 4, 6, 8]);
    });

    it("visto desde arriba avanzando hacia abajo, los impares (izquierda) quedan a la derecha", () => {
        const g = geometriaPasillo(pasillo("P"), 0);
        const x = (m: number) => g.celdas.find((c) => c.modulo === m)!.x;
        expect(x(1)).toBeGreaterThan(g.xEje);
        expect(x(2)).toBeLessThan(g.xEje);
    });

    it("un pasillo de una cara solo tiene celdas de esa cara", () => {
        const g = geometriaPasillo(pasillo("P", { caras: "IZQUIERDA", modulos: 3 }), 0);
        expect(g.celdas.map((c) => c.modulo)).toEqual([1, 3, 5]);
        expect(g.alto).toBe(3 * MEDIDAS.modulo);
    });

    it("los pasillos van uno junto a otro por su posición", () => {
        expect(geometriaPasillo(pasillo("B"), 1).x).toBeGreaterThan(geometriaPasillo(pasillo("A"), 0).x);
    });

    it("separa las sueltas y ordena los huecos de un nivel", () => {
        const us = [ubi("1", { hueco: 2 }), ubi("2", { hueco: 1 }), ubi("3", { nivel: 1 }),
            ubi("4", { pasilloId: null, modulo: null })];
        expect(huecosDe(us.slice(0, 3), 0).map((u) => u.ubicacionId)).toEqual(["2", "1"]);
        expect(ubicacionesSueltas(us, "Z").map((u) => u.ubicacionId)).toEqual(["4"]);
    });
});

describe("mapa · capas", () => {
    it("ocupación del módulo: vacío, parcial, lleno", () => {
        expect(tonoModulo([ubi("1")], "OCUPACION", SIN)).toBe("vacio");
        expect(tonoModulo([ubi("1", { cantidad: 3 }), ubi("2")], "OCUPACION", SIN)).toBe("parcial");
        expect(tonoModulo([ubi("1", { cantidad: 3 })], "OCUPACION", SIN)).toBe("lleno");
        expect(tonoModulo([], "OCUPACION", SIN)).toBe("sin-ubicaciones");
    });

    it("slotting cruza la clase del artículo con la del hueco", () => {
        expect(tonoSlotting({ claseArticulo: "A", claseUbicacion: "A" })).toBe("ok");
        expect(tonoSlotting({ claseArticulo: "A", claseUbicacion: "C" })).toBe("rota-mas");
        expect(tonoSlotting({ claseArticulo: "C", claseUbicacion: "A" })).toBe("rota-menos");
        expect(tonoSlotting({ claseArticulo: null, claseUbicacion: "A" })).toBe("sin-dato");
        // En el módulo manda lo que hay que corregir.
        expect(tonoModulo([ubi("1", { claseArticulo: "A" }), ubi("2", { claseArticulo: "A", claseUbicacion: "C" })],
            "SLOTTING", SIN)).toBe("rota-mas");
    });

    it("picking fijo bajo mínimo", () => {
        const pf = { articuloId: "R", minimo: 10, maximo: 20 };
        expect(tonoUbicacion(ubi("1", { pickingFijo: pf, cantidad: 4 }), "PICKING", SIN)).toBe("bajo-minimo");
        expect(tonoUbicacion(ubi("1", { pickingFijo: pf, cantidad: 12 }), "PICKING", SIN)).toBe("picking");
        expect(tonoUbicacion(ubi("1"), "PICKING", SIN)).toBe("sin-dato");
    });

    it("clase de almacenamiento: un color por código, mezcla si hay varias", () => {
        const m = mapa([ubi("1", { clasesAlmacenamiento: ["PQ"] }), ubi("2", { clasesAlmacenamiento: ["PNQ"] })]);
        const paleta = paletaClases(m);
        expect([...paleta.entries()]).toEqual([["PNQ", 0], ["PQ", 1]]);
        expect(tonoUbicacion(m.ubicaciones[0], "CLASE_ALMACENAMIENTO", paleta)).toBe("clase-1");
        expect(tonoModulo(m.ubicaciones, "CLASE_ALMACENAMIENTO", paleta)).toBe("mezcla");
        expect(leyenda("CLASE_ALMACENAMIENTO", paleta)[0]).toEqual({ tono: "clase-0", texto: "PNQ" });
    });

    it("letra ABC según la capa", () => {
        const u = ubi("1", { claseUbicacion: "B", claseArticulo: "A" });
        expect(letraUbicacion(u, "ABC_UBICACION")).toBe("B");
        expect(letraUbicacion(u, "ABC_ARTICULO")).toBe("A");
        expect(letraUbicacion(u, "SLOTTING")).toBe("A");
        expect(letraUbicacion(u, "OCUPACION")).toBeNull();
        expect(letraModulo([u, ubi("2", { claseUbicacion: "A" })], "ABC_UBICACION")).toBe("A");
        expect(letraModulo([ubi("3")], "ABC_ARTICULO")).toBeNull();
    });

    it("lista corta de artículos", () => {
        expect(listaCorta(["a", "b"])).toBe("a, b");
        expect(listaCorta(["1", "2", "3", "4", "5", "6", "7"])).toBe("1, 2, 3, 4, 5 y 2 más");
    });

    it("bloqueo y mejor clase", () => {
        expect(tonoModulo([ubi("1", { bloqueada: true }), ubi("2")], "BLOQUEO", SIN)).toBe("parcial-bloqueada");
        expect(mejorClase([null, "C", "B"])).toBe("B");
        expect(mejorClase([null])).toBeNull();
    });
});

describe("mapa · recorrido", () => {
    const recorrido: RecorridoOrden = {
        ordenId: "S1", estado: "PENDIENTE", modulosRecorridos: 10, pasillosCruzados: 2,
        calculo: "FORMULA", motivo: "SIN_PLANTA", metros: null, inicioUbicacionId: null, finUbicacionId: null,
        paradas: [
            { secuencia: 1, ubicacionId: "1", ubicacion: "U1", zona: "PIC", pasillo: "P1", modulo: 1, nivel: 0, hueco: 1, accion: "RECOGER", lineas: [] },
            { secuencia: 2, ubicacionId: "2", ubicacion: "U2", zona: "PIC", pasillo: "P2", modulo: 3, nivel: 0, hueco: 1, accion: "RECOGER", lineas: [] },
            { secuencia: 3, ubicacionId: "9", ubicacion: "PLAYA", zona: "SAL", pasillo: null, modulo: null, nivel: null, hueco: null, accion: "DEJAR", lineas: [] },
        ],
    };
    const m = mapa([ubi("1"), ubi("2", { pasilloId: "P2", modulo: 3 }), ubi("9", { pasilloId: null, modulo: null })]);

    it("sitúa las paradas con pasillo y aparta las demás", () => {
        expect(puntosRecorrido(recorrido, m).map((p) => [p.secuencia, p.pasilloId, p.modulo]))
            .toEqual([[1, "P1", 1], [2, "P2", 3]]);
        expect(paradasSinPasillo(recorrido, m).map((p) => p.ubicacion)).toEqual(["PLAYA"]);
    });

    it("entra y sale de cada pasillo por la cabecera", () => {
        const geometrias = m.zonas[0].pasillos.map(geometriaPasillo);
        const trazo = trazoRecorrido(puntosRecorrido(recorrido, m), geometrias);
        const cabecera = MEDIDAS.cabecera / 2;
        // cabecera P1, parada 1, cabecera P1, cabecera P2, parada 2, cabecera P2
        expect(trazo).toHaveLength(6);
        expect(trazo[0]).toEqual({ x: geometrias[0].xEje, y: cabecera });
        expect(trazo[2].y).toBe(cabecera);
        expect(trazo[5]).toEqual({ x: geometrias[1].xEje, y: cabecera });
    });
});
