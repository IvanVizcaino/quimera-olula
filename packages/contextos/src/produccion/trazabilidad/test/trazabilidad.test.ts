import { describe, expect, it } from "vitest";
import { ConsumoLote, LoteTrazado, MovimientoLote, Trazabilidad } from "../diseño.ts";
import {
    cantidadConSigno,
    enlaceDeConsumos,
    filasArbol,
    textoDocumentoMovimiento,
    textoErrorLectura,
    textoTercero,
    textoTipoMovimientoLote,
} from "../dominio.ts";
import {
    entradasSalidasDesdeApi,
    MovimientoLoteApi,
    trazabilidadDesdeApi,
} from "../infraestructura.ts";

const movimientoApi = (cambios: Partial<MovimientoLoteApi> = {}): MovimientoLoteApi => ({
    id: 10, lote_id: "MP1", articulo_id: "HILO", tipo: "albaran_compra", entrada: true, cantidad: "100.5",
    fecha: "2026-11-20", hora: "10:15:00", concepto: null, almacen_id: "ALG", documento_id: 3, codigo: "A0001",
    tercero_id: "P001", tercero: "Hilaturas", proceso_id: null, orden_id: null, lote_producido_id: null, tarea_id: null,
    ...cambios,
});

const consumo = (cambios: Partial<ConsumoLote>): ConsumoLote => ({
    id: "1", loteId: "", loteProducidoId: "", articuloId: "", articulo: "", cantidad: 0, fecha: "",
    tareaId: "", tareaProcesoId: "", tarea: "", tramoId: "", procesoId: "", ordenId: "", ...cambios,
});

const lote = (loteId: string, nivel: number, consumos: ConsumoLote[] = [], cambios: Partial<LoteTrazado> = {}): LoteTrazado => ({
    loteId, articuloId: `ART-${loteId}`, articulo: "", caducidad: "", ordenId: "", fechaFabricacion: "", clienteId: "",
    nivel, existe: true, documentos: [], consumos, ...cambios,
});

const movimiento = (cambios: Partial<MovimientoLote>): MovimientoLote => ({
    id: "1", loteId: "L", articuloId: "A", tipo: "otro", entrada: true, cantidad: 1, fecha: "", hora: "", concepto: "",
    almacenId: "", documentoId: "", codigo: "", terceroId: "", tercero: "", procesoId: "", ordenId: "",
    loteProducidoId: "", tareaId: "", ...cambios,
});

describe("trazabilidad: conversores", () => {
    it("lee la trazabilidad hacia atrás con compras y consumos (vacíos en texto)", () => {
        const t = trazabilidadDesdeApi({
            lote_id: "PT1", niveles: 1, truncado: false,
            lotes: [
                {
                    lote_id: "PT1", articulo_id: "TELA", articulo: "Tela", caducidad: null, orden_id: "OP1",
                    fecha_fabricacion: "2026-11-21", cliente_id: null, nivel: 0, existe: true, compras: [],
                    consumos: [{
                        id: 7, lote_id: "MP1", lote_producido_id: "PT1", articulo_id: "HILO", articulo: "Hilo",
                        cantidad: "20", fecha: "2026-11-21", tarea_id: "T1", tarea_proceso_id: 701, tarea: "Tejer",
                        tramo_id: 4, proceso_id: 9, orden_id: "OP1",
                    }],
                },
                {
                    lote_id: "MP1", articulo_id: "HILO", articulo: "Hilo", caducidad: "2027-01-31", orden_id: null,
                    fecha_fabricacion: null, cliente_id: null, nivel: 1, existe: true, compras: [movimientoApi()], consumos: [],
                },
            ],
        }, "atras");
        expect(t).toMatchObject({ sentido: "atras", loteId: "PT1", niveles: 1, truncado: false, clientes: [] });
        expect(t.lotes[0]).toMatchObject({ loteId: "PT1", ordenId: "OP1", fechaFabricacion: "2026-11-21", clienteId: "", documentos: [] });
        expect(t.lotes[0].consumos[0]).toEqual({
            id: "7", loteId: "MP1", loteProducidoId: "PT1", articuloId: "HILO", articulo: "Hilo", cantidad: 20,
            fecha: "2026-11-21", tareaId: "T1", tareaProcesoId: "701", tarea: "Tejer", tramoId: "4", procesoId: "9", ordenId: "OP1",
        });
        expect(t.lotes[1].caducidad).toBe("2027-01-31");
        expect(t.lotes[1].documentos[0]).toMatchObject({
            id: "10", tipo: "albaran_compra", entrada: true, cantidad: 100.5, hora: "10:15", documentoId: "3",
            codigo: "A0001", terceroId: "P001", tercero: "Hilaturas", procesoId: "", ordenId: "",
        });
    });

    it("hacia delante usa ventas y consumido_en, y lee los clientes y el truncado", () => {
        const t = trazabilidadDesdeApi({
            lote_id: "MP1", niveles: 20, truncado: true,
            lotes: [{
                lote_id: "MP1", articulo_id: "HILO", articulo: null, caducidad: null, orden_id: null,
                fecha_fabricacion: null, cliente_id: null, nivel: 0, existe: false,
                ventas: [movimientoApi({ tipo: "albaran_venta", entrada: false, cantidad: -5, tercero_id: "C1", tercero: "Cliente" })],
                consumido_en: [{
                    id: 8, lote_id: "MP1", lote_producido_id: "PT1", articulo_id: "HILO", articulo: null, cantidad: 3,
                    fecha: null, tarea_id: null, tarea_proceso_id: null, tarea: null, tramo_id: null, proceso_id: null, orden_id: null,
                }],
            }],
            clientes: [{ cliente_id: "C1", cliente: null, lotes: ["PT1"] }],
        }, "adelante");
        expect(t.truncado).toBe(true);
        expect(t.lotes[0].existe).toBe(false);
        expect(t.lotes[0].documentos[0]).toMatchObject({ tipo: "albaran_venta", entrada: false, cantidad: -5 });
        expect(t.lotes[0].consumos[0]).toMatchObject({ loteProducidoId: "PT1", cantidad: 3, tareaProcesoId: "" });
        expect(t.clientes).toEqual([{ clienteId: "C1", cliente: "", lotes: ["PT1"] }]);
    });

    it("lee las entradas y salidas con sus totales", () => {
        const es = entradasSalidasDesdeApi({
            lote_id: "MP1", articulo_id: "HILO", articulo: "Hilo", caducidad: "2027-01-31T00:00:00", orden_id: null,
            fecha_fabricacion: null, cliente_id: null, entradas: 100, salidas: "30.25", saldo: 69.75,
            movimientos: [movimientoApi(), movimientoApi({ id: 11, tipo: "produccion", entrada: null, cantidad: -30.25 })],
        });
        expect(es).toMatchObject({ loteId: "MP1", caducidad: "2027-01-31", entradas: 100, salidas: 30.25, saldo: 69.75 });
        expect(es.movimientos[1]).toMatchObject({ id: "11", entrada: false, cantidad: -30.25 });
    });
});

describe("trazabilidad: dominio", () => {
    it("formatea la cantidad con su signo en español", () => {
        expect(cantidadConSigno(12500.5)).toBe("+12.500,5");
        expect(cantidadConSigno(-20)).toBe("−20");
        expect(cantidadConSigno(0)).toBe("0");
    });

    it("da el tipo, el documento y el tercero del movimiento", () => {
        expect(textoTipoMovimientoLote("albaran_compra")).toBe("Albarán de compra");
        expect(textoTipoMovimientoLote("raro")).toBe("raro");
        expect(textoDocumentoMovimiento(movimiento({ tipo: "albaran_compra", codigo: "A0001" }))).toBe("A0001");
        expect(textoDocumentoMovimiento(movimiento({ tipo: "produccion", entrada: false, cantidad: -2, ordenId: "OP1", loteProducidoId: "PT1" })))
            .toBe("Orden OP1 para el lote PT1");
        expect(textoDocumentoMovimiento(movimiento({ tipo: "produccion", ordenId: "OP1", loteProducidoId: "PT1" }))).toBe("Orden OP1");
        expect(textoDocumentoMovimiento(movimiento({ tipo: "transferencia", documentoId: "5" }))).toBe("Transferencia 5");
        expect(textoDocumentoMovimiento(movimiento({ concepto: "Regularización" }))).toBe("Regularización");
        expect(textoTercero({ terceroId: "P1", tercero: "Hilaturas" })).toBe("P1 - Hilaturas");
        expect(textoTercero({ terceroId: "P1", tercero: "" })).toBe("P1");
    });

    it("suma los consumos de un enlace, sin repetir tareas ni órdenes", () => {
        expect(enlaceDeConsumos([
            consumo({ cantidad: 2, tarea: "Tejer", ordenId: "OP1", fecha: "2026-11-22" }),
            consumo({ cantidad: 3.5, tarea: "Tejer", ordenId: "OP1", fecha: "2026-11-21" }),
            consumo({ cantidad: 1, tareaId: "T9", ordenId: "OP1" }),
        ])).toEqual({ cantidad: 6.5, tareas: ["Tejer", "T9"], ordenes: ["OP1"], fecha: "2026-11-21" });
    });

    it("dibuja el árbol hacia atrás por niveles: tramos sumados, componentes sin lote y lotes repetidos", () => {
        const t: Trazabilidad = {
            sentido: "atras", loteId: "PT1", niveles: 2, truncado: false, clientes: [],
            lotes: [
                lote("PT1", 0, [
                    consumo({ loteId: "SEMI", loteProducidoId: "PT1", cantidad: 4 }),
                    consumo({ loteId: "MP1", loteProducidoId: "PT1", cantidad: 1 }),
                    consumo({ loteId: "", articuloId: "TINTE", articulo: "Tinte", loteProducidoId: "PT1", cantidad: 0.5 }),
                ]),
                lote("MP1", 1),
                lote("SEMI", 1, [
                    consumo({ loteId: "MP1", loteProducidoId: "SEMI", cantidad: 2, tarea: "Tejer" }),
                    consumo({ loteId: "MP1", loteProducidoId: "SEMI", cantidad: 3, tarea: "Tejer" }),
                ]),
            ],
        };
        const filas = filasArbol(t);
        expect(filas.map((f) => [f.profundidad, f.loteId || f.sinLote?.articuloId, f.enlace?.cantidad ?? null, f.repetido])).toEqual([
            [0, "PT1", null, false],
            [1, "SEMI", 4, false],
            [2, "MP1", 5, false],
            [1, "MP1", 1, true],
            [1, "TINTE", 0.5, false],
        ]);
        expect(new Set(filas.map((f) => f.clave)).size).toBe(filas.length);
        expect(filas[4].sinLote).toEqual({ articuloId: "TINTE", articulo: "Tinte" });
    });

    it("dibuja el árbol hacia delante por los lotes producidos y sin ciclos", () => {
        const t: Trazabilidad = {
            sentido: "adelante", loteId: "MP1", niveles: 2, truncado: false, clientes: [],
            lotes: [
                lote("MP1", 0, [
                    consumo({ loteId: "MP1", loteProducidoId: "PT1", cantidad: 2 }),
                    consumo({ loteId: "MP1", loteProducidoId: "PT1", cantidad: 1 }),
                ]),
                // Un ciclo (no debería darse) no se recorre dos veces.
                lote("PT1", 1, [consumo({ loteId: "PT1", loteProducidoId: "MP1", cantidad: 1 })]),
                lote("OTRO", 1),
            ],
        };
        expect(filasArbol(t).map((f) => [f.profundidad, f.loteId, f.enlace?.cantidad ?? null, f.repetido])).toEqual([
            [0, "MP1", null, false],
            [1, "PT1", 3, false],
            [2, "MP1", 1, true],
        ]);
    });

    it("muestra un lote hijo que el servidor no ha devuelto (truncado) sin abrirlo", () => {
        const t: Trazabilidad = {
            sentido: "atras", loteId: "PT1", niveles: 1, truncado: true, clientes: [],
            lotes: [lote("PT1", 0, [consumo({ loteId: "LEJOS", loteProducidoId: "PT1", cantidad: 1 })])],
        };
        const filas = filasArbol(t);
        expect(filas[1]).toMatchObject({ loteId: "LEJOS", lote: null, profundidad: 1 });
    });
});

describe("trazabilidad: errores", () => {
    it("dice que el lote no existe con un 404", () => {
        expect(textoErrorLectura({ estado: 404 }, "otro")).toBe("El lote no existe.");
        expect(textoErrorLectura({ estado: 500 }, "otro")).toBe("otro");
        expect(textoErrorLectura(null, "otro")).toBe("otro");
    });
});
