import { describe, expect, it } from "vitest";
import {
    configTerminalDesdeApi,
    consumosDesdeApi,
    loteLeidoDesdeApi,
    tareaTerminalDesdeApi,
    trabajadorLeidoDesdeApi,
    tramoDesdeApi,
} from "../infraestructura.ts";

describe("terminal: conversores", () => {
    it("operario por código", () => {
        expect(trabajadorLeidoDesdeApi({ codigo: "T1", existe: true, nombre: "Ana", de_baja: false }))
            .toEqual({ codigo: "T1", existe: true, nombre: "Ana", deBaja: false });
        expect(trabajadorLeidoDesdeApi({ codigo: "X", existe: false, nombre: null, de_baja: null }))
            .toEqual({ codigo: "X", existe: false, nombre: "", deBaja: false });
    });

    it("configuración del puesto", () => {
        expect(configTerminalDesdeApi({
            usar_tramos: true, mostrar_formulario: false, control_tiempo: null, decimales: 3, maximo_tramo: "99.99", permite_deshacer: false,
        })).toEqual({ usarTramos: true, mostrarFormulario: false, controlTiempo: false, decimales: 3, maximoTramo: 99.99, permiteDeshacer: false });
        expect(configTerminalDesdeApi({
            usar_tramos: null, mostrar_formulario: null, control_tiempo: null, decimales: null, maximo_tramo: null, permite_deshacer: null,
        })).toMatchObject({ decimales: 2, maximoTramo: null, permiteDeshacer: true });
    });

    it("tarea del terminal con lo hecho y la unidad", () => {
        const t = tareaTerminalDesdeApi({
            id: "TA000001", proceso_id: 3, orden_id: "OP1", estado: "EN CURSO", codigo: "T1", descripcion: "Tejer",
            tarea_proceso_id: 1, tipo_tarea_id: "TEJER", tipo_proceso_id: "P", orden: 1, inicial: true, final: false,
            termina_en_un_paso: false, centro_id: null, realizada_por: "T1", dia_inicio: null, tiempo_inicio: null,
            dia_fin: null, tiempo_fin: null, intervalo: null, tiempo_invertido: null, cantidad: "100", cantidad_hecha: "12.5", unidad: "Horas",
        });
        expect(t).toMatchObject({ id: "TA000001", estado: "EN CURSO", cantidad: 100, cantidadHecha: 12.5, unidad: "Horas" });
    });

    it("consumos de la tarea", () => {
        const c = consumosDesdeApi({
            id: "TA000001", estado: "EN CURSO", codigo: "T1", descripcion: null, final: true, proceso_id: 3, orden_id: "OP1",
            lote_id: "L1", articulo_id: "TELA", articulo: "Tela", cantidad_prevista: 100, cantidad_hecha: "10", cantidad_pendiente: 90,
            unidad: null,
            componentes: [{
                componente_id: 11, articulo_id: "HILO", descripcion: "Hilo", cantidad_unidad: "2", previsto: 200, consumido: 20,
                pendiente: 180, por_lotes: true, minimo: 80, puede_cerrar: true, lotes: [{ lote_id: "LA", cantidad: "20", tramo_id: 5 }],
            }],
        });
        expect(c).toMatchObject({ final: true, cantidadHecha: 10, cantidadPendiente: 90, descripcion: "" });
        expect(c.componentes[0]).toEqual({
            componenteId: "11", articuloId: "HILO", descripcion: "Hilo", cantidadUnidad: 2, previsto: 200, consumido: 20,
            pendiente: 180, porLotes: true, minimo: 80, puedeCerrar: true, lotes: [{ loteId: "LA", cantidad: 20, tramoId: "5" }],
        });
    });

    it("tramo y lote leído", () => {
        expect(tramoDesdeApi({
            id: 5, tarea_id: "TA000001", trabajador_id: "T1", trabajador: "Ana", cantidad: "10", dia_inicio: "2026-11-24T00:00:00",
            tiempo_inicio: "08:00:00", dia_fin: "2026-11-24", tiempo_fin: "10:00:00",
            movimientos: [{ componente_id: null, articulo_id: "TELA", lote_id: "L1", cantidad: 10 }, { componente_id: 11, articulo_id: "HILO", lote_id: null, cantidad: "-20" }],
        })).toEqual({
            id: "5", tareaId: "TA000001", trabajadorId: "T1", trabajador: "Ana", cantidad: 10, diaInicio: "2026-11-24",
            tiempoInicio: "08:00:00", diaFin: "2026-11-24", tiempoFin: "10:00:00",
            movimientos: [
                { componenteId: "", articuloId: "TELA", loteId: "L1", cantidad: 10 },
                { componenteId: "11", articuloId: "HILO", loteId: "", cantidad: -20 },
            ],
        });
        expect(loteLeidoDesdeApi({
            id: "LA", articulo_id: "HILO", articulo: null, caducidad: null, en_almacen: "30", disponible: 25, por_lotes: true, componente_id: 11,
        })).toEqual({ id: "LA", articuloId: "HILO", articulo: "", caducidad: "", enAlmacen: 30, disponible: 25, porLotes: true, componenteId: "11" });
    });
});
