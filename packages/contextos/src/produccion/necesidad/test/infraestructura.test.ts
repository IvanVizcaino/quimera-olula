import { describe, expect, it } from "vitest";
import { necesidadDesdeApi, ordenesGeneradasDesdeApi, peticionGenerarAApi, respuestaNecesidadesDesdeApi } from "../infraestructura.ts";

describe("generar órdenes: conversores", () => {
    it("lee la respuesta de necesidades (fila de pedido)", () => {
        const r = respuestaNecesidadesDesdeApi({
            total: 1, pedido_completo: true, almacen_id: "ALM", a_faltas: false,
            datos: [{
                id: "pedido:41", origen: "pedido", pedido_id: "P0001", linea_pedido_id: 41, cliente_id: "000001",
                cliente: "Cliente", fecha_pedido: "2026-11-20", fecha_salida: "2026-11-30T00:00:00", articulo_id: "CAMISA",
                descripcion: "Camisa", tipo_proceso_id: null, pendiente: 8, cubierta: 2, existencias: 1, disponible: -7,
                por_recibir: 0, a_faltas: null, stock_minimo: 5, stock_maximo: 0, cantidad_necesaria: null, compuestos: [],
                cantidad: 8, lotes: [{ lote_id: "LS1", orden_id: "OP1", cantidad: 2 }], ordenes_abiertas: ["OP1"],
                avisos: ["Sin tipo de proceso"], lanzable: false,
            }],
        });
        expect(r).toMatchObject({ total: 1, pedidoCompleto: true, almacenId: "ALM", aFaltas: false });
        expect(r.datos[0]).toEqual({
            id: "pedido:41", origen: "pedido", pedidoId: "P0001", lineaPedidoId: "41", clienteId: "000001", cliente: "Cliente",
            fechaPedido: "2026-11-20", fechaSalida: "2026-11-30", articuloId: "CAMISA", descripcion: "Camisa", tipoProcesoId: "",
            pendiente: 8, cubierta: 2, existencias: 1, disponible: -7, porRecibir: 0, aFaltas: null, stockMinimo: 5, stockMaximo: 0,
            cantidadNecesaria: null, compuestos: [], cantidad: 8, lotes: [{ loteId: "LS1", ordenId: "OP1", cantidad: 2 }],
            ordenesAbiertas: ["OP1"], avisos: ["Sin tipo de proceso"], lanzable: false,
        });
    });

    it("componente: sin pendiente, con cantidad necesaria y compuestos; nulos a vacío", () => {
        const n = necesidadDesdeApi({
            id: "componente:TELA", origen: "componente", pedido_id: null, linea_pedido_id: null, cliente_id: null, cliente: null,
            fecha_pedido: null, fecha_salida: null, articulo_id: "TELA", descripcion: null, tipo_proceso_id: "TP",
            pendiente: null, cubierta: null, existencias: null, disponible: null, por_recibir: null, a_faltas: 3,
            stock_minimo: null, stock_maximo: null, cantidad_necesaria: 12.5, compuestos: ["CAMISA"], cantidad: 12.5,
            lotes: null, ordenes_abiertas: null, avisos: null, lanzable: true,
        });
        expect(n).toMatchObject({
            origen: "componente", pendiente: null, cantidadNecesaria: 12.5, compuestos: ["CAMISA"], aFaltas: 3, lineaPedidoId: "",
            descripcion: "", lotes: [], avisos: [], lanzable: true,
        });
    });

    it("la petición de generar: línea de pedido solo si hay, fecha de fabricación solo si se indica", () => {
        expect(peticionGenerarAApi({
            filas: [{ articuloId: "CAMISA", cantidad: 2.5, lineaPedidoId: "7" }, { articuloId: "TELA", cantidad: 1, lineaPedidoId: "" }],
            lanzar: true, fechaFabricacion: "",
        })).toEqual({
            filas: [{ articulo_id: "CAMISA", cantidad: 2.5, linea_pedido_id: "7" }, { articulo_id: "TELA", cantidad: 1 }],
            lanzar: true,
        });
        expect(peticionGenerarAApi({ filas: [], lanzar: false, fechaFabricacion: "2026-12-20" }).fecha_fabricacion).toBe("2026-12-20");
    });

    it("lee las órdenes generadas con sus reservas", () => {
        const r = ordenesGeneradasDesdeApi({
            ordenes: [{
                id: "OP2", fecha: "2026-11-24", fecha_entrega: null, estado: "PTE", descripcion: null, pedido_id: "P0001",
                cliente_id: "000001", total_lotes: 1, total_uds: 8, lanzada: true,
                lotes: [{
                    id: "LS2", articulo_id: "CAMISA", cantidad: 8, cantidad_programada: 8, estado: "PTE",
                    fecha_fabricacion: "2026-12-14", cliente_id: "000001", linea_pedido_id: "41",
                    reservas: [{ linea_pedido_id: "41", cantidad: 8 }],
                }],
            }],
            procesos: [{ id: 1 }],
        });
        expect(r.procesos).toBe(1);
        expect(r.ordenes[0]).toMatchObject({ id: "OP2", pedidoId: "P0001", lanzada: true });
        expect(r.ordenes[0].lotes[0].reservas).toEqual([{ lineaPedidoId: "41", pedidoId: "", cantidad: 8 }]);
    });
});
