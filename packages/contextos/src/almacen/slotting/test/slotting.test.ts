import { describe, expect, it } from "vitest";
import {
    construirQuery,
    enteroPositivo,
    textoDestinoRecolocacion,
    origenRotacion,
    ORIGEN_POR_DEFECTO,
    clasesPickingValidas,
    errorValidacionFila,
    filaPickingDesdePropuesta,
    filasPickingACrear,
    mensajeErrorApi,
    puedeCrearFilaPicking,
    resumenCreacionPicking,
} from "../dominio.ts";
import { propuestaPickingDesdeApi, articuloAbcDesdeApi, propuestaDesdeApi, recolocacionDesdeApi } from "../infraestructura.ts";

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

describe("origen de la rotación", () => {
    it("acepta ORDENES y VENTAS y, si no, usa el de por defecto", () => {
        expect(origenRotacion("VENTAS")).toBe("VENTAS");
        expect(origenRotacion("ORDENES")).toBe("ORDENES");
        expect(origenRotacion("PEDIDOS")).toBe(ORIGEN_POR_DEFECTO);
        expect(origenRotacion(null)).toBe(ORIGEN_POR_DEFECTO);
    });

    it("viaja en la query string", () => {
        expect(construirQuery({ almacen_id: "ALG", dias: 365, origen: "VENTAS" }))
            .toBe("?almacen_id=ALG&dias=365&origen=VENTAS");
    });
});

describe("slotting picking fijo", () => {
    const api = {
        articulo_id: "REF1", descripcion: "Disolvente", clase: "A" as const, lineas: 120, unidades: 860,
        ubicacion_id: "17", ubicacion: "PIC-A-01-1-1", zona: "PIC", accesibilidad: 1,
        minimo: 24, maximo: 48, unidad_reposicion: 1,
    };
    const sinHueco = { ...api, articulo_id: "REF2", ubicacion_id: null, ubicacion: null, zona: null, accesibilidad: null };

    it("mapea la propuesta de la API", () => {
        expect(propuestaPickingDesdeApi(api)).toMatchObject({
            articuloId: "REF1", ubicacionId: "17", unidadReposicion: 1, accesibilidad: 1,
        });
        expect(propuestaPickingDesdeApi(sinHueco)).toMatchObject({ ubicacionId: null, ubicacion: null, zona: null });
    });

    it("selecciona por defecto solo las filas con ubicación", () => {
        expect(filaPickingDesdePropuesta(propuestaPickingDesdeApi(api)).seleccionada).toBe(true);
        const f = filaPickingDesdePropuesta(propuestaPickingDesdeApi(sinHueco));
        expect(f.seleccionada).toBe(false);
        expect(puedeCrearFilaPicking(f)).toBe(false);
    });

    it("valida las cantidades de la fila", () => {
        const f = filaPickingDesdePropuesta(propuestaPickingDesdeApi(api));
        expect(errorValidacionFila(f)).toBeNull();
        expect(errorValidacionFila({ ...f, maximo: 10, minimo: 10 })).toMatch(/máximo/);
        expect(errorValidacionFila({ ...f, minimo: NaN })).toMatch(/mínimo/);
        expect(puedeCrearFilaPicking({ ...f, unidadReposicion: 0 })).toBe(false);
    });

    it("solo crea filas marcadas, válidas y no creadas", () => {
        const f = filaPickingDesdePropuesta(propuestaPickingDesdeApi(api));
        const desmarcada = { ...f, articuloId: "X", seleccionada: false };
        const creada = { ...f, articuloId: "Y", estado: "CREADO" as const };
        const invalida = { ...f, articuloId: "Z", maximo: 0 };
        expect(filasPickingACrear([f, desmarcada, creada, invalida]).map((r) => r.articuloId)).toEqual(["REF1"]);
        expect(resumenCreacionPicking([f, creada], 2)).toBe("Creados 1 de 2");
    });

    it("extrae el mensaje de error de la API", () => {
        expect(mensajeErrorApi({ nombre: "Error", descripcion: '{"detail":"Ya existe"}' })).toBe("Ya existe");
        expect(mensajeErrorApi({ nombre: "Error al crear", descripcion: "texto plano" })).toBe("texto plano");
        expect(mensajeErrorApi({ nombre: "Error 500" })).toBe("Error 500");
        expect(mensajeErrorApi(null)).toBe("Error al crear picking fijo");
    });

    it("clases válidas con valor por defecto", () => {
        expect(clasesPickingValidas("A")).toBe("A");
        expect(clasesPickingValidas("x")).toBe("AB");
    });
});
