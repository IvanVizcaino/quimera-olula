import { describe, expect, it } from "vitest";
import { etiquetaEstadoMovimiento, ordenarMovimientos, textoTareaMovimiento, textoTipoMovimiento } from "../dominio.ts";
import { movimientoDesdeApi } from "../infraestructura.ts";

const api = {
    id: 101, tipo: "consumo", proceso_id: 7, orden_id: "OP1", articulo_id: "TELA", articulo: "Tela", almacen_id: "ALG",
    cantidad: "-25.5", estado: "PTE", lote_id: null, lote_producido_id: "LS1", componente_id: 3, tarea_proceso_id: 31,
    tarea_id: null, fecha_prevista: "2026-11-24", fecha_real: null,
};

describe("movimientos de producción", () => {
    it("lee el movimiento (ids en texto, cantidad en número, vacíos en texto)", () => {
        expect(movimientoDesdeApi(api)).toEqual({
            id: "101", tipo: "consumo", procesoId: "7", ordenId: "OP1", articuloId: "TELA", articulo: "Tela", almacenId: "ALG",
            cantidad: -25.5, estado: "PTE", loteId: "", loteProducidoId: "LS1", componenteId: "3", tareaProcesoId: "31",
            tareaId: "", fechaPrevista: "2026-11-24", fechaReal: "",
        });
    });

    it("estado, tipo y orden (la entrada primero)", () => {
        expect(etiquetaEstadoMovimiento("HECHO")).toEqual({ texto: "Hecho", tono: "completado" });
        expect(etiquetaEstadoMovimiento("PTE")).toEqual({ texto: "Pendiente", tono: "pendiente" });
        expect(textoTipoMovimiento("entrada")).toBe("Entrada");
        expect(textoTipoMovimiento("consumo")).toBe("Consumo");
        const consumo = movimientoDesdeApi(api);
        const entrada = movimientoDesdeApi({ ...api, id: 100, tipo: "entrada", cantidad: 10 });
        expect(ordenarMovimientos([consumo, entrada]).map((m) => m.id)).toEqual(["100", "101"]);
    });

    it("la tarea: la que lo hizo, o en la que se consumirá", () => {
        const tareas = [{ id: "TA000002", tareaProcesoId: "31", descripcion: "Coser" }];
        const consumo = movimientoDesdeApi(api);
        expect(textoTareaMovimiento(consumo, tareas)).toBe("En TA000002 (Coser)");
        expect(textoTareaMovimiento({ ...consumo, tareaId: "TA000002" }, tareas)).toBe("TA000002");
        expect(textoTareaMovimiento({ ...consumo, tareaProcesoId: "" }, tareas)).toBe("En la tarea final");
        expect(textoTareaMovimiento({ ...consumo, tipo: "entrada", tareaProcesoId: "" }, tareas)).toBe("Al terminar el proceso");
        expect(textoTareaMovimiento({ ...consumo, tareaProcesoId: "99" }, tareas)).toBe("");
    });
});
