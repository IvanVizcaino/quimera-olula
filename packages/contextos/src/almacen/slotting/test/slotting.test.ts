import { describe, expect, it } from "vitest";
import { construirQuery, enteroPositivo, textoDestinoRecolocacion } from "../dominio.ts";
import { articuloAbcDesdeApi, propuestaDesdeApi, recolocacionDesdeApi } from "../infraestructura.ts";

describe("slotting dominio", () => {
    it("construye la query omitiendo vacíos y codificando", () => {
        expect(construirQuery({ almacen_id: "ALG", dias: 90 })).toBe("?almacen_id=ALG&dias=90");
        expect(construirQuery({ a: "x y", b: "", c: undefined, d: null })).toBe("?a=x%20y");
        expect(construirQuery({})).toBe("");
    });

    it("entero positivo con valor por defecto", () => {
        expect(enteroPositivo("30", 90)).toBe(30);
        expect(enteroPositivo("", 90)).toBe(90);
        expect(enteroPositivo("0", 5)).toBe(5);
        expect(enteroPositivo("abc", 5)).toBe(5);
    });

    it("describe el destino de la recolocación", () => {
        expect(textoDestinoRecolocacion({ accion: "INTERCAMBIAR", conArticuloId: "REF9", conUbicacion: "PIC-1" }))
            .toBe("con REF9 (PIC-1)");
        expect(textoDestinoRecolocacion({ accion: "MOVER", conArticuloId: null, conUbicacion: "PIC-2" })).toBe("a PIC-2");
        expect(textoDestinoRecolocacion({ accion: "MOVER", conArticuloId: null, conUbicacion: null })).toBe("");
    });
});

describe("slotting mappers", () => {
    it("mapea ABC", () => {
        expect(articuloAbcDesdeApi({
            articulo_id: "REF1", descripcion: "D", lineas: 120, unidades: 860, porcentaje_acumulado: 41.2, clase: "A",
        })).toEqual({ articuloId: "REF1", descripcion: "D", lineas: 120, unidades: 860, porcentajeAcumulado: 41.2, clase: "A" });
    });

    it("mapea la propuesta", () => {
        expect(propuestaDesdeApi({
            articulo_id: "REF1", clase: "A",
            ubicaciones: [{ ubicacion_id: "40", ubicacion: "APQ-A-02-0-1", zona: "APQ", accesibilidad: 3, clase_ubicacion: "A" }],
        })).toEqual({
            articuloId: "REF1", clase: "A",
            ubicaciones: [{ ubicacionId: "40", ubicacion: "APQ-A-02-0-1", zona: "APQ", accesibilidad: 3, claseUbicacion: "A" }],
        });
    });

    it("mapea la recolocación, con y sin pareja", () => {
        const base = { articulo_id: "REF1", clase: "A" as const, ubicacion: "U1", clase_ubicacion: "C" as const, beneficio: 540 };
        expect(recolocacionDesdeApi({ ...base, accion: "INTERCAMBIAR", con_articulo_id: "REF9", con_ubicacion: "U2" })).toEqual({
            articuloId: "REF1", clase: "A", ubicacion: "U1", claseUbicacion: "C", accion: "INTERCAMBIAR",
            conArticuloId: "REF9", conUbicacion: "U2", beneficio: 540,
        });
        expect(recolocacionDesdeApi({ ...base, accion: "MOVER", con_ubicacion: "U3" }).conArticuloId).toBeNull();
    });
});
