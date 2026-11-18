import { OrdenAlmacen, TipoOrden } from "../diseño.ts";
import { ordenDesdeApi } from "../infraestructura.ts";
import { etiquetaEstadoOrden, lineaOrdenVacia, ordenAlbaranable, ordenVacia } from "../dominio.ts";
import { calcularAccionPrincipal } from "../vistas/detalle/accion_principal.ts";

describe("ordenAlbaranable", () => {
    test.each([
        ["SALIDA preparada", "SALIDA", "PREPARADA", true],
        ["SALIDA en curso", "SALIDA", "EN_CURSO", false],
        ["SALIDA terminada (ya albaranada)", "SALIDA", "TERMINADA", false],
        ["ENTRADA preparada", "ENTRADA", "PREPARADA", false],
        ["TRASPASO terminada", "TRASPASO", "TERMINADA", false],
    ])("%s", (_, tipo, estado, esperado) => {
        expect(ordenAlbaranable({ tipo: tipo as TipoOrden, estado })).toBe(esperado);
    });
});

describe("calcularAccionPrincipal en SALIDA", () => {
    const handlers = () => ({
        emitirPickSolicitado: vi.fn(),
        emitirDropSolicitado: vi.fn(),
        emitirColocacionSolicitada: vi.fn(),
        emitirAlbaranadoSolicitado: vi.fn(),
    });

    const salida = (estado: string): OrdenAlmacen => ({
        ...ordenVacia(),
        id: "S00001",
        tipo: "SALIDA",
        estado,
        lineas: [{ ...lineaOrdenVacia(), id: "1", cantidadPrevista: 5, cantidadReal: 5, cantidadPick: 5 }],
    });

    test("PREPARADA ofrece Albaranar", () => {
        const h = handlers();
        const accion = calcularAccionPrincipal(salida("PREPARADA"), h);

        expect(accion?.label).toBe("Albaranar");
        accion?.onClick();
        expect(h.emitirAlbaranadoSolicitado).toHaveBeenCalledOnce();
    });

    test("TERMINADA no ofrece ninguna acción", () => {
        expect(calcularAccionPrincipal(salida("TERMINADA"), handlers())).toBeNull();
    });
});

describe("etiquetaEstadoOrden", () => {
    test.each([
        ["PENDIENTE", "Pendiente", "borrador"],
        ["EN_CURSO", "En curso", "pendiente"],
        ["PREPARADA", "Preparada", "parcial"],
        ["TERMINADA", "Terminada", "completado"],
    ])("%s", (estado, texto, tono) => {
        expect(etiquetaEstadoOrden({ estado })).toEqual({ texto, tono });
    });

    test("un estado desconocido se muestra tal cual", () => {
        expect(etiquetaEstadoOrden({ estado: "RARO" })).toEqual({ texto: "RARO", tono: "borrador" });
    });
});

describe("ordenDesdeApi: albaranes", () => {
    const api = (albaranes?: { id: number; codigo: string }[]) => ({
        id: "S00001", fecha: "2026-11-03", tipo: "SALIDA", almacen_id: "ALG", almacen: "Algeciras",
        abierta: false, estado: "TERMINADA", descripcion: "SALIDA S00001",
        ubicacion_origen_id: null, ubicacion_origen: null, caja_origen_id: null,
        ubicacion_destino_id: null, ubicacion_destino: null, caja_destino_id: null,
        pasos_pick: null, pasos_drop: null, lineas: [], lecturas_caja: [],
        ...(albaranes ? { albaranes } : {}),
    }) as unknown as Parameters<typeof ordenDesdeApi>[0];

    test("convierte id y código de cada albarán", () => {
        expect(ordenDesdeApi(api([{ id: 7, codigo: "A000007" }])).albaranes)
            .toEqual([{ id: "7", codigo: "A000007" }]);
    });

    test("sin albaranes en la respuesta queda una lista vacía", () => {
        expect(ordenDesdeApi(api()).albaranes).toEqual([]);
    });
});
