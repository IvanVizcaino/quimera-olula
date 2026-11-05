import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { lineaOrdenVacia, ordenVacia } from "#/almacen/orden/dominio.ts";
import { definicion } from "#/almacen/orden/pasos/catalogo.ts";
import {
    camposPendientes,
    FLUJOS,
    flujoDePasos,
    flujoPorDefecto,
    flujosDeTipo,
} from "#/almacen/orden/pasos/flujos.ts";
import { describe, expect, test } from "vitest";

const linea = (pasosPick: string | null, pasosDrop: string | null): LineaOrdenAlmacen =>
    ({ ...lineaOrdenVacia(), pasosPick, pasosDrop });

const orden = (parcial: Partial<OrdenAlmacen>): OrdenAlmacen =>
    ({ ...ordenVacia(), tipo: "TRASPASO", pasosPick: null, pasosDrop: null, lineas: [], ...parcial });

describe("[flujos] catálogo de flujos", () => {
    test("cada flujo usa códigos de pasos del catálogo y tiene explicación", () => {
        for (const f of FLUJOS) {
            if (f.pasosPick) expect(definicion(f.pasosPick, "PICK"), f.codigo).not.toBeNull();
            for (const alt of f.pasosPickAlternativos ?? []) expect(definicion(alt, "PICK")).not.toBeNull();
            if (f.pasosDrop) expect(definicion(f.pasosDrop, "DROP"), f.codigo).not.toBeNull();
            expect(f.pasosPick || f.pasosDrop).toBeTruthy();
            expect(f.explicacion.length).toBeGreaterThan(20);
        }
    });

    test("un pick que recoge cajas enteras se completa con un drop de cajas", () => {
        for (const f of FLUJOS.filter((x) => x.pasosPick && x.pasosDrop)) {
            const pick = definicion(f.pasosPick, "PICK")!;
            const drop = definicion(f.pasosDrop, "DROP")!;
            if (pick.manejoCaja === "COMPLETA" || pick.destino === "CAJA_ETIQUETA") {
                expect(drop.que, f.codigo).toBe("CAJA");
            }
        }
    });

    test("traspaso ofrece los cuatro flujos acordados", () => {
        expect(flujosDeTipo("TRASPASO").map((f) => f.nombre)).toEqual([
            "Sin pick (directo)", "Cajas completas", "Material de caja o suelto", "Palé → cajas etiqueta",
        ]);
    });
});

describe("[flujos] reconocer pasos existentes", () => {
    test("palé → cajas etiqueta, con y sin lotes", () => {
        expect(flujoDePasos("TRASPASO", "LOTE-CAJAS", "CAJAS-UBICACION")?.codigo).toBe("TRASPASO_PALET");
        expect(flujoDePasos("TRASPASO", "CAJA-CAJAS", "CAJAS-UBICACION")?.codigo).toBe("TRASPASO_PALET");
    });

    test("líneas creadas por los casos de uso", () => {
        expect(flujoDePasos("TRASPASO", "CAJAS", "CAJAS-UBICACION")?.codigo).toBe("TRASPASO_CAJAS");
        expect(flujoDePasos("SALIDA", "SKU_CAJA", null)?.codigo).toBe("SALIDA_MATERIAL");
        expect(flujoDePasos("ENTRADA", null, "SKU-CANTIDAD")?.codigo).toBe("ENTRADA_SUELTO");
    });

    test("combinaciones sin flujo devuelven null", () => {
        expect(flujoDePasos("TRASPASO", "CAJAS", "SKU-CANTIDAD")).toBeNull();
        expect(flujoDePasos("SALIDA", "LOTE_CAJA", null)).toBeNull();
    });
});

describe("[flujos] flujo por defecto de una línea nueva", () => {
    test("el de la cabecera", () => {
        expect(flujoPorDefecto(orden({ pasosPick: "CAJAS", pasosDrop: "CAJAS-UBICACION" }))?.codigo).toBe("TRASPASO_CAJAS");
    });

    test("si la cabecera no tiene pasos, el de la última línea", () => {
        const o = orden({ lineas: [linea("CAJAS", "CAJAS-UBICACION"), linea("SKU_CAJA", "SKU-CANTIDAD")] });
        expect(flujoPorDefecto(o)?.codigo).toBe("TRASPASO_MATERIAL");
    });

    test("si no hay nada, el primero del tipo", () => {
        expect(flujoPorDefecto(orden({}))?.codigo).toBe("TRASPASO_SIN_PICK");
        expect(flujoPorDefecto(orden({ tipo: "ENTRADA" }))?.codigo).toBe("ENTRADA_SUELTO");
    });
});

describe("[flujos] campos obligatorios", () => {
    const vacia = { idUbicacionOrigen: null, idCajaOrigen: null, idUbicacionDestino: null };

    test("palé: palé origen y ubicación destino", () => {
        const f = flujoDePasos("TRASPASO", "LOTE-CAJAS", "CAJAS-UBICACION")!;
        expect(camposPendientes(f, vacia)).toEqual(["palé origen", "ubicación destino"]);
        expect(camposPendientes(f, { ...vacia, idCajaOrigen: "P1", idUbicacionDestino: "U1" })).toEqual([]);
    });

    test("cajas completas: solo la ubicación destino es obligatoria", () => {
        const f = flujoDePasos("TRASPASO", "CAJAS", "CAJAS-UBICACION")!;
        expect(camposPendientes(f, vacia)).toEqual(["ubicación destino"]);
    });
});
