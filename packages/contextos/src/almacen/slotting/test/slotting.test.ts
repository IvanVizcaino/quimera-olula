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
    marcarTodasPicking,
    todasPickingMarcadas,
    filaPickingMarcable,
    explicacionAbc,
    puedeUbicarMigracion,
    resumenMigracion,
    explicacionCantidadesPicking,
} from "../dominio.ts";
import { resultadoMigracionDesdeApi, propuestaPickingDesdeApi, articuloAbcDesdeApi, propuestaDesdeApi, recolocacionDesdeApi } from "../infraestructura.ts";

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

describe("marcar y desmarcar todas las filas de picking", () => {
    const fila = (articuloId: string, ubicacionId: string | null, estado: "PENDIENTE" | "CREADO" | "ERROR", seleccionada: boolean) =>
        ({ articuloId, ubicacionId, estado, seleccionada }) as unknown as Parameters<typeof filaPickingMarcable>[0] & { seleccionada: boolean };

    const filas = [
        fila("CON_HUECO", "1", "PENDIENTE", false),
        fila("SIN_HUECO", null, "PENDIENTE", false),
        fila("CREADA", "2", "CREADO", false),
        fila("CON_ERROR", "3", "ERROR", true),
    ] as unknown as Parameters<typeof marcarTodasPicking>[0];

    it("marcar todas solo marca las que tienen hueco y no están creadas", () => {
        expect(marcarTodasPicking(filas, true).map((f) => f.seleccionada)).toEqual([true, false, false, true]);
    });

    it("desmarcar las desmarca todas", () => {
        expect(marcarTodasPicking(filas, false).every((f) => !f.seleccionada)).toBe(true);
    });

    it("sabe si están todas las marcables marcadas", () => {
        expect(todasPickingMarcadas(filas)).toBe(false);
        expect(todasPickingMarcadas(marcarTodasPicking(filas, true))).toBe(true);
    });
});

describe("explicación del ABC", () => {
    it("dice de dónde sale la rotación y el periodo", () => {
        expect(explicacionAbc("VENTAS", 365)[0]).toContain("albarán de venta");
        expect(explicacionAbc("VENTAS", 365)[0]).toContain("365 días");
        expect(explicacionAbc("ORDENES", 90)[0]).toContain("órdenes de salida");
    });
});

describe("migración", () => {
    const api = {
        simulado: true, lineas_ubicadas: 2, unidades_ubicadas: 110, lineas_retiradas: 1, unidades_retiradas: 3,
        ajustes: [
            { stock_id: "1", articulo_id: "A", lote_id: null, cantidad: 100 },
            { stock_id: "2", articulo_id: "B", lote_id: "L1", cantidad: 10 },
            { stock_id: "3", articulo_id: "C", lote_id: null, cantidad: -3 },
        ],
    };

    it("mapea el resultado de la API", () => {
        const r = resultadoMigracionDesdeApi(api);
        expect(r.ajustes[1]).toEqual({ stockId: "2", articuloId: "B", loteId: "L1", cantidad: 10 });
        expect(r.lineasUbicadas).toBe(2);
    });

    it("resume lo que se va a hacer", () => {
        expect(resumenMigracion(resultadoMigracionDesdeApi(api)))
            .toBe("Simulación: 2 líneas a ubicar (110 unidades), 1 a retirar (3 unidades).");
        expect(resumenMigracion({ ...resultadoMigracionDesdeApi(api), ajustes: [] })).toContain("No hay nada que ubicar");
    });

    it("solo deja ubicar tras una simulación con ajustes", () => {
        const simulado = resultadoMigracionDesdeApi(api);
        expect(puedeUbicarMigracion(simulado)).toBe(true);
        expect(puedeUbicarMigracion({ ...simulado, simulado: false })).toBe(false);
        expect(puedeUbicarMigracion({ ...simulado, ajustes: [] })).toBe(false);
        expect(puedeUbicarMigracion(null)).toBe(false);
    });
});

describe("explicación de las cantidades de picking", () => {
    it("incluye los días de reposición y de cobertura elegidos", () => {
        const texto = explicacionCantidadesPicking(5, 2).join(" ");
        expect(texto).toContain("2 día(s) laborable(s) de reposición");
        expect(texto).toContain("5 día(s) laborable(s) de cobertura");
    });
});
