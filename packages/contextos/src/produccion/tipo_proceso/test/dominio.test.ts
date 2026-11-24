import { describe, expect, it } from "vitest";
import { Secuencia, TareaProceso } from "../diseño.ts";
import {
    esSecuencial,
    formDesdeTarea,
    marcasTarea,
    metaCopiaTipoProceso,
    motivoSecuenciaNoValida,
    nombreTarea,
    nuevaTareaProcesoVacia,
    nuevoTipoProcesoVacio,
    opcionTareaProceso,
    validarTareaProceso,
    validarTipoProceso,
} from "../dominio.ts";
import { cambiosTipoProcesoAApi, tareaAApi, tareaProcesoItemDesdeApi, tipoProcesoDesdeApi } from "../infraestructura.ts";

const tarea = (id: string, extra: Partial<TareaProceso> = {}): TareaProceso => ({
    id, tipoTareaId: "CORTE", tipoTarea: "Corte", descripcion: `Tarea ${id}`, orden: Number(id), codigo: `P_${id}`,
    inicial: false, final: false, terminaEnUnPaso: false, verificarConsumos: false, opcional: false, ...extra,
});

const secuencia = (ini: string, fin: string): Secuencia => ({
    id: `${ini}-${fin}`, tareaInicioId: ini, codigoInicio: "", descripcionInicio: "", tareaFinId: fin,
    codigoFin: "", descripcionFin: "", requerida: true,
});

describe("tipos de proceso", () => {
    it("exige código (hasta 15) y descripción, y un tiempo no negativo", () => {
        const valido = { ...nuevoTipoProcesoVacio, id: "PROC", descripcion: "Proceso" };
        expect(validarTipoProceso(valido)).toBe(true);
        expect(validarTipoProceso({ ...valido, id: "x".repeat(16) })).not.toBe(true);
        expect(validarTipoProceso({ ...valido, descripcion: "" })).not.toBe(true);
        expect(validarTipoProceso({ ...valido, tiempoMedio: -5 })).not.toBe(true);
    });

    it("lee el tipo con tareas, secuencias y si está completo (Dias sin tilde es Días)", () => {
        const tipo = tipoProcesoDesdeApi({
            id: "P", descripcion: "Proceso", tiempo_medio: 3600, tiempo_unidad: 1, unidad: "Dias",
            generar_todas: true, secuencial: false, fabricacion: true, tipo_produccion: "Fabricación",
            tareas: [{
                id: 7, tipo_tarea_id: "CORTE", tipo_tarea: "Corte", descripcion: "Cortar", orden: 1, codigo: "P_CORTE",
                inicial: true, final: false, termina_en_un_paso: false, verificar_consumos: true, opcional: false,
            }],
            secuencias: [{
                id: "1", tarea_inicio_id: 7, codigo_inicio: "P_CORTE", descripcion_inicio: "Cortar",
                tarea_fin_id: 8, codigo_fin: null, descripcion_fin: null, requerida: true,
            }],
            completo: false, motivos_incompleto: ["Falta la tarea final"],
        });
        expect(tipo.unidad).toBe("Días");
        expect(tipo.tareas[0]).toMatchObject({ id: "7", codigo: "P_CORTE", inicial: true, verificarConsumos: true });
        expect(tipo.secuencias[0]).toMatchObject({ id: "7-8", tareaInicioId: "7", tareaFinId: "8", codigoFin: "" });
        expect(tipo.completo).toBe(false);
        expect(tipo.motivosIncompleto).toEqual(["Falta la tarea final"]);
    });

    it("en la lista (sin completo) no avisa", () => {
        const tipo = tipoProcesoDesdeApi({
            id: "P", descripcion: null, tiempo_medio: null, tiempo_unidad: null, unidad: null,
            generar_todas: null, secuencial: null, fabricacion: null, tipo_produccion: null,
        });
        expect(tipo).toMatchObject({ completo: true, unidad: "Segundos", tipoProduccion: "Fabricación", tareas: [] });
    });

    it("manda los checkboxes como booleanos", () => {
        expect(cambiosTipoProcesoAApi({ secuencial: "true", fabricacion: "false", generarTodas: true, tiempoMedio: null }))
            .toEqual({ secuencial: true, fabricacion: false, generar_todas: true, tiempo_medio: null });
        expect(esSecuencial({ secuencial: "true" })).toBe(true);
        expect(esSecuencial({ secuencial: false })).toBe(false);
    });
});

describe("tareas del tipo de proceso", () => {
    it("exige el tipo de tarea y un orden entero no negativo", () => {
        const valida = { ...nuevaTareaProcesoVacia(), tipoTareaId: "CORTE" };
        expect(validarTareaProceso(valida)).toBe(true);
        expect(validarTareaProceso(nuevaTareaProcesoVacia())).not.toBe(true);
        expect(validarTareaProceso({ ...valida, orden: -1 })).not.toBe(true);
        expect(validarTareaProceso({ ...valida, orden: 1.5 })).not.toBe(true);
    });

    it("sin descripción ni orden deja que los ponga el servidor", () => {
        expect(tareaAApi({ ...nuevaTareaProcesoVacia(), tipoTareaId: "CORTE", inicial: "true" })).toEqual({
            tipo_tarea_id: "CORTE", inicial: true, final: false, termina_en_un_paso: false,
            verificar_consumos: false, opcional: false,
        });
        expect(tareaAApi({ ...formDesdeTarea(tarea("3")), descripcion: " Cortar " }))
            .toMatchObject({ descripcion: "Cortar", orden: 3 });
    });

    it("marcas y nombres para la rejilla y los selectores", () => {
        expect(marcasTarea(tarea("1", { inicial: true, opcional: true }))).toBe("Inicial, Opcional");
        expect(marcasTarea(tarea("1"))).toBe("");
        expect(nombreTarea("P_CORTE", "Cortar")).toBe("P_CORTE - Cortar");
        expect(nombreTarea("", "Cortar")).toBe("Cortar");
        const item = tareaProcesoItemDesdeApi({
            id: 9, tipo_proceso_id: "P", tipo_proceso: "Proceso", tipo_tarea_id: "CORTE", descripcion: "Cortar",
            orden: 1, codigo: "P_CORTE", inicial: true, final: true, termina_en_un_paso: false,
            verificar_consumos: false, opcional: false,
        });
        expect(opcionTareaProceso(item)).toEqual({ valor: "9", descripcion: "P · P_CORTE - Cortar" });
        expect(opcionTareaProceso(item, false)).toEqual({ valor: "9", descripcion: "P_CORTE - Cortar" });
    });
});

describe("secuencias", () => {
    it("pide tareas distintas y no repetidas", () => {
        const existentes = [secuencia("1", "2")];
        expect(motivoSecuenciaNoValida("", "2", existentes)).not.toBeNull();
        expect(motivoSecuenciaNoValida("2", "2", existentes)).not.toBeNull();
        expect(motivoSecuenciaNoValida("1", "2", existentes)).toBe("Esa secuencia ya existe");
        expect(motivoSecuenciaNoValida("2", "3", existentes)).toBeNull();
    });
});

describe("copia", () => {
    it("exige el código nuevo", () => {
        expect(metaCopiaTipoProceso.validacion?.({ nuevoId: "", descripcion: "" })).not.toBe(true);
        expect(metaCopiaTipoProceso.validacion?.({ nuevoId: "P2", descripcion: "" })).toBe(true);
    });
});
