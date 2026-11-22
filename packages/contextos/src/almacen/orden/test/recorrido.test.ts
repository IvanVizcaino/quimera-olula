import { motivoRecorridoVacio, resumenRecorrido } from "#/almacen/orden/dominio.ts";
import { RecorridoOrdenApi, recorridoOrdenDesdeApi } from "#/almacen/orden/infraestructura.ts";
import { describe, expect, test } from "vitest";

const api: RecorridoOrdenApi = {
    orden_id: "S000123",
    estado: "PENDIENTE",
    modulos_recorridos: 34,
    pasillos_cruzados: 4,
    paradas: [
        {
            secuencia: 1, ubicacion_id: "40", ubicacion: "APQ-A-02-0-1", zona: "APQ",
            pasillo: "A", modulo: 2, nivel: 0, hueco: 1, accion: "DEJAR",
            lineas: [{ linea_id: "7", sku: "REF1", pendiente: 12 }],
        },
        { secuencia: 2, ubicacion_id: "50", ubicacion: "PLAYA", lineas: [] },
    ],
};

describe("recorridoOrdenDesdeApi", () => {
    test("mapea cabecera y paradas a camelCase", () => {
        const r = recorridoOrdenDesdeApi(api);
        expect(r.ordenId).toBe("S000123");
        expect(r.modulosRecorridos).toBe(34);
        expect(r.pasillosCruzados).toBe(4);
        expect(r.paradas[0]).toEqual({
            secuencia: 1, ubicacionId: "40", ubicacion: "APQ-A-02-0-1", zona: "APQ",
            pasillo: "A", modulo: 2, nivel: 0, hueco: 1, accion: "DEJAR",
            lineas: [{ lineaId: "7", sku: "REF1", pendiente: 12 }],
        });
        expect(r.estado).toBe("PENDIENTE");
    });

    test("campos de posición ausentes pasan a null", () => {
        const p = recorridoOrdenDesdeApi(api).paradas[1];
        expect(p.pasillo).toBeNull();
        expect(p.modulo).toBeNull();
        expect(p.accion).toBe("RECOGER");
    });
});

describe("resumenRecorrido", () => {
    test("plural", () => {
        expect(resumenRecorrido({ modulosRecorridos: 34, pasillosCruzados: 4 }))
            .toBe("34 módulos recorridos, 4 pasillos cruzados");
    });
    test("singular", () => {
        expect(resumenRecorrido({ modulosRecorridos: 1, pasillosCruzados: 1 }))
            .toBe("1 módulo recorrido, 1 pasillo cruzado");
    });
});

describe("motivoRecorridoVacio", () => {
    test("terminada", () => {
        expect(motivoRecorridoVacio({ ordenId: "T1", estado: "TERMINADA" }))
            .toBe("La orden T1 está terminada: no queda nada por recoger ni dejar.");
    });
    test("otro estado", () => {
        expect(motivoRecorridoVacio({ ordenId: "T1", estado: "PENDIENTE" }))
            .toBe("La orden T1 no tiene nada pendiente en ubicaciones (pendiente).");
    });
});

describe("resumenRecorrido por distancia real", () => {
    it("da los metros cuando se ordena por la planta y el motivo cuando no", () => {
        expect(resumenRecorrido({ modulosRecorridos: 34, pasillosCruzados: 4, calculo: "DISTANCIA", metros: 45.6 }))
            .toBe("46 m a pie, ordenado por la planta");
        expect(resumenRecorrido({
            modulosRecorridos: 34, pasillosCruzados: 4, calculo: "FORMULA", motivo: "PARADAS_SIN_POSICION",
        })).toBe("34 módulos recorridos, 4 pasillos cruzados (estimado: hay paradas en pasillos sin colocar en la planta)");
    });
});
