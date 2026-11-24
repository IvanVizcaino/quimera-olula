import { describe, expect, it } from "vitest";
import { cuerpoAccionTarea, tareaDesdeApi } from "../infraestructura.ts";

describe("tarea de producción: conversores", () => {
    it("lee la tarea de la consulta (vacíos en texto, números y booleanos)", () => {
        expect(tareaDesdeApi({
            id: "TA000012", proceso_id: 7, orden_id: "OP00000003", estado: "TERMINADA", codigo: "CORTE",
            descripcion: "Cortar", tarea_proceso_id: 31, tipo_tarea_id: "CORTAR", tipo_proceso_id: "CAMISAS", orden: 2,
            inicial: false, final: true, termina_en_un_paso: false, centro_id: "C1", realizada_por: "T01", trabajador: "Ana",
            dia_inicio: "2026-11-24", tiempo_inicio: "09:00:00", dia_fin: "2026-11-24", tiempo_fin: "09:30:00",
            intervalo: 1800, tiempo_invertido: "0.5", estado_proceso: "EN CURSO", estado_orden: "EN CURSO",
            lote_id: "LS00000004", articulo_id: "CAMISA", articulo: "Camisa", cantidad: "12.5",
        })).toEqual({
            id: "TA000012", procesoId: "7", ordenId: "OP00000003", estado: "TERMINADA", codigo: "CORTE",
            descripcion: "Cortar", tareaProcesoId: "31", tipoTareaId: "CORTAR", tipoProcesoId: "CAMISAS", orden: 2,
            inicial: false, final: true, terminaEnUnPaso: false, centroId: "C1", realizadaPor: "T01", trabajador: "Ana",
            diaInicio: "2026-11-24", tiempoInicio: "09:00:00", diaFin: "2026-11-24", tiempoFin: "09:30:00",
            intervalo: 1800, tiempoInvertido: 0.5, estadoProceso: "EN CURSO", estadoOrden: "EN CURSO",
            loteId: "LS00000004", articuloId: "CAMISA", articulo: "Camisa", cantidad: 12.5,
        });
    });

    it("lee la tarea del proceso de los comandos (sin orden ni lote)", () => {
        const t = tareaDesdeApi({
            id: "TA000013", proceso_id: "7", orden_id: null, estado: null, codigo: null, descripcion: null,
            tarea_proceso_id: null, tipo_tarea_id: null, tipo_proceso_id: null, orden: null, inicial: null, final: null,
            termina_en_un_paso: null, centro_id: null, realizada_por: null, dia_inicio: null, tiempo_inicio: null,
            dia_fin: null, tiempo_fin: null, intervalo: null, tiempo_invertido: "",
        });
        expect(t).toMatchObject({ estado: "OFF", ordenId: "", orden: 0, inicial: false, intervalo: null, tiempoInvertido: null, cantidad: null, loteId: "" });
    });

    it("cuerpo de la acción: el trabajador solo al iniciar y si se indica", () => {
        expect(cuerpoAccionTarea("iniciar", " T01 ")).toEqual({ trabajador_id: "T01" });
        expect(cuerpoAccionTarea("iniciar", "")).toEqual({});
        expect(cuerpoAccionTarea("iniciar")).toEqual({});
        expect(cuerpoAccionTarea("terminar", "T01")).toEqual({});
    });
});
