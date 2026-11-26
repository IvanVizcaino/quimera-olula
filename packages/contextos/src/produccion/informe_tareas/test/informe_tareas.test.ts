import { cambiosFicha, fichaAApi, fichaDesdeApi, fichaNueva, metaFichaInforme } from "#/comun/informe_documentos/dominio.ts";
import { FichaInforme } from "#/comun/informe_documentos/diseño.ts";
import { describe, expect, test } from "vitest";
import {
    ajustarInformeTareas,
    fechaCorta,
    lineaResultado,
    nombreFicheroTareas,
    tiempo,
    tituloGrupo,
    unidadComun,
} from "../dominio.ts";
import {
    resultadoInformeTareasDesdeApi,
    urlHojaInformeTareas,
    urlReportInformeTareas,
    urlResultadoInformeTareas,
} from "../infraestructura.ts";
import { INFORME_TAREAS } from "../pestañas.ts";

const fila = {
    orden_id: "OP00000001", pedido_id: null, cliente_id: "000001", cliente: "Cliente", tarea_id: "TA000001",
    lote_id: "LS00000001", estado: "TERMINADA", descripcion: "Cortar", fecha_prevista: null, dia_inicio: "2026-11-24",
    dia_fin: "2026-11-25", centro_id: "C1", tiempo_previsto: 0, tiempo_real: 1.5, diferencia: -1.5, unidad: "Horas",
};

const api = {
    titulo: "Tareas de producción",
    agrupado: true,
    subtitulo: "Estado: TERMINADA",
    grupos: [
        { centro_id: "C1", centro: "Corte", tipo_centro_id: "MAQ", filas: [fila], total_previsto: 0, total_real: 1.5, total_diferencia: -1.5 },
        { centro_id: null, centro: null, tipo_centro_id: null, filas: [], total_previsto: 0, total_real: 0, total_diferencia: 0 },
    ],
    total_previsto: 0,
    total_real: 1.5,
    total_diferencia: -1.5,
    total_tareas: 1,
};

describe("Fichas del informe de tareas", () => {
    test("la ficha nueva lleva los defectos del mtd", () => {
        const ficha = fichaNueva(INFORME_TAREAS);
        expect(ficha).toMatchObject({
            formato: "Sin agrupar", estado: "Todos", solo_sin_terminar: false, intervalo_prevista: "",
            orden1: "No ordenar", tipo_orden1: "Ascendente", orden2: "No ordenar", orden3: "No ordenar", tipo_orden3: "Ascendente",
            orden_id: "", lote_id: "", centro_id: "",
        });
    });

    test("tiene todos los criterios del contrato", () => {
        const ids = INFORME_TAREAS.filas.flat().map((c) => c.id).sort();
        expect(ids).toEqual([
            "centro_id", "cliente_id", "estado", "fecha_prevista_desde", "fecha_prevista_hasta", "fecha_realizacion_desde",
            "fecha_realizacion_hasta", "formato", "intervalo_prevista", "intervalo_realizacion", "lote_id", "orden1", "orden2",
            "orden3", "orden_id", "pedido_id", "solo_sin_terminar", "tipo_centro_id", "tipo_orden1", "tipo_orden2", "tipo_orden3",
        ]);
        expect(INFORME_TAREAS.url).toBe("/produccion/informe/tareas");
        expect(INFORME_TAREAS.regla).toBe("produccion.informe_tareas");
    });

    test("a la API: vacíos a null y la casilla booleana", () => {
        const ficha = { ...fichaNueva(INFORME_TAREAS), descripcion: "Lote 1", lote_id: "LS00000001", solo_sin_terminar: true };
        expect(fichaAApi(INFORME_TAREAS, ficha)).toMatchObject({
            descripcion: "Lote 1", lote_id: "LS00000001", orden_id: null, fecha_prevista_desde: null,
            solo_sin_terminar: true, formato: "Sin agrupar", estado: "Todos",
        });
    });

    test("desde la API y cambios para el PATCH", () => {
        const ficha = fichaDesdeApi(INFORME_TAREAS)({
            id: 7, descripcion: "Por centros", formato: "Centros de coste", estado: "EN CURSO", solo_sin_terminar: "true",
            fecha_realizacion_desde: "2026-11-01", centro_id: null,
        });
        expect(ficha).toMatchObject({ id: "7", formato: "Centros de coste", solo_sin_terminar: true, centro_id: "", fecha_realizacion_desde: "2026-11-01" });
        expect(cambiosFicha(INFORME_TAREAS, ficha, { ...ficha, centro_id: "C1", estado: "Todos" }))
            .toEqual({ centro_id: "C1", estado: "Todos" });
    });

    test("al elegir un intervalo se rellenan sus fechas", () => {
        const hoy = new Date(2026, 10, 25);
        const ficha: FichaInforme = { ...fichaNueva(INFORME_TAREAS), intervalo_realizacion: "000005" };
        expect(ajustarInformeTareas(ficha, "intervalo_realizacion", hoy)).toMatchObject({
            fecha_realizacion_desde: "2026-11-01", fecha_realizacion_hasta: "2026-11-30", fecha_prevista_desde: "",
        });
        const prevista = { ...ficha, intervalo_prevista: "000001" };
        expect(ajustarInformeTareas(prevista, "intervalo_prevista", hoy)).toMatchObject({
            fecha_prevista_desde: "2026-11-25", fecha_prevista_hasta: "2026-11-25",
        });
        // Sin intervalo, las fechas se quedan como están; otro campo no las toca.
        const conFechas = { ...ficha, intervalo_prevista: "", fecha_prevista_desde: "2026-01-01" };
        expect(ajustarInformeTareas(conFechas, "intervalo_prevista", hoy).fecha_prevista_desde).toBe("2026-01-01");
        expect(ajustarInformeTareas(prevista, "estado", hoy)).toBe(prevista);
    });

    test("la meta de la ficha aplica los intervalos al cambiar", () => {
        const meta = metaFichaInforme(INFORME_TAREAS);
        const ficha = { ...fichaNueva(INFORME_TAREAS), intervalo_prevista: "000009", fecha_prevista_desde: "2026-01-01" };
        const ajustada = meta.onChange!(ficha as never, "intervalo_prevista", "") as unknown as FichaInforme;
        expect(ajustada.fecha_prevista_desde).toBe("");
    });
});

describe("Resultado del informe de tareas", () => {
    test("convierte la respuesta de la API", () => {
        const r = resultadoInformeTareasDesdeApi(api);
        expect(r).toMatchObject({ agrupado: true, totalReal: 1.5, totalDiferencia: -1.5, totalTareas: 1, subtitulo: "Estado: TERMINADA" });
        expect(r.grupos[0]).toMatchObject({ centroId: "C1", centro: "Corte", tipoCentroId: "MAQ", totalReal: 1.5 });
        expect(r.grupos[1]).toMatchObject({ centroId: null, centro: "", tipoCentroId: "" });
        expect(r.grupos[0].filas[0]).toEqual({
            ordenId: "OP00000001", pedidoId: "", clienteId: "000001", cliente: "Cliente", tareaId: "TA000001",
            loteId: "LS00000001", estado: "TERMINADA", descripcion: "Cortar", fechaPrevista: "", diaInicio: "2026-11-24",
            diaFin: "2026-11-25", centroId: "C1", tiempoPrevisto: 0, tiempoReal: 1.5, diferencia: -1.5, unidad: "Horas",
        });
    });

    test("textos del resultado", () => {
        expect(tituloGrupo({ centroId: "C1", centro: "Corte", tipoCentroId: "MAQ" })).toBe("C1 · Corte (MAQ)");
        expect(tituloGrupo({ centroId: null, centro: "", tipoCentroId: "" })).toBe("Sin centro de coste");
        expect(tiempo(1234.5)).toBe("1.234,50");
        expect(tiempo(-1.5)).toBe("-1,50");
        expect(fechaCorta("2026-11-25")).toBe("25/11/2026");
        expect(fechaCorta("")).toBe("");
        expect(unidadComun([{ unidad: "Horas" }, { unidad: "Horas" }, { unidad: "" }])).toBe("Horas");
        expect(unidadComun([{ unidad: "Horas" }, { unidad: "Minutos" }])).toBe("");
        expect(lineaResultado({ subtitulo: "Estado: TERMINADA", totalTareas: 1 })).toBe("Estado: TERMINADA · 1 tarea");
        expect(lineaResultado({ subtitulo: "", totalTareas: 3 })).toBe("3 tareas");
    });

    test("URLs y nombre de fichero", () => {
        expect(urlResultadoInformeTareas("7")).toBe("/produccion/informe/tareas/7/resultado");
        expect(urlReportInformeTareas("7")).toBe("/produccion/informe/tareas/7/report");
        expect(urlHojaInformeTareas("7", "ods")).toBe("/produccion/informe/tareas/7/hoja?formato=ods");
        expect(nombreFicheroTareas(INFORME_TAREAS, { descripcion: "Lote Camión" }, "xlsx")).toBe("tareas-produccion-lote-camion.xlsx");
    });
});
