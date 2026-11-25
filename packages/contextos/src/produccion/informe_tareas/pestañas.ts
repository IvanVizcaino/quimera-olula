import { CampoInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { OPCIONES_INTERVALO } from "#/comun/informe_documentos/dominio.ts";
import { ControlCentro, ControlCliente, ControlLote, ControlOrden, ControlPedido, ControlTipoCentro } from "./controles.tsx";
import { ajustarInformeTareas } from "./dominio.ts";
import { URL_INFORME_TAREAS } from "./infraestructura.ts";
import { ResultadoInformeTareas } from "./resultado/ResultadoInformeTareas.tsx";

/**
 * Criterios de `pr_i_tareas` de Eneboo, en filas como su formulario. Los nombres y los valores
 * de las opciones son los de la API (los que guarda Eneboo).
 */

const opciones = (valores: string[]) => valores.map((valor) => ({ valor, descripcion: valor }));

export const FORMATOS = opciones(["Sin agrupar", "Centros de coste"]);
export const ESTADOS = [
    { valor: "Todos", descripcion: "Todos" },
    { valor: "OFF", descripcion: "OFF" },
    { valor: "PTE", descripcion: "Pendiente" },
    { valor: "EN CURSO", descripcion: "En curso" },
    { valor: "EN PAUSA", descripcion: "En pausa" },
    { valor: "TERMINADA", descripcion: "Terminada" },
];
export const ORDENES1 = opciones(["No ordenar", "Cliente", "Pedido", "Orden", "Lote"]);
export const ORDENES2 = opciones(["No ordenar", "Estado"]);
export const ORDENES3 = opciones(["No ordenar", "Fecha prevista"]);
export const SENTIDOS = opciones(["Ascendente", "Descendente"]);

const combo = (id: string, label: string, valores: CampoInforme["opciones"]): CampoInforme => ({
    id,
    label,
    tipo: "opciones",
    opciones: valores,
});

const fecha = (id: string, label: string): CampoInforme => ({ id, label, tipo: "fecha" });

const propio = (id: string, label: string, Control: CampoInforme["Control"]): CampoInforme => ({
    id,
    label,
    tipo: "propio",
    Control,
});

export const INFORME_TAREAS: PestañaInforme = {
    clave: "tareas_produccion",
    titulo: "Tareas de producción",
    url: URL_INFORME_TAREAS,
    regla: "produccion.informe_tareas",
    filas: [
        [combo("formato", "Formato", FORMATOS)],
        [
            combo("intervalo_prevista", "Inicio previsto", OPCIONES_INTERVALO),
            fecha("fecha_prevista_desde", "Desde"),
            fecha("fecha_prevista_hasta", "Hasta"),
        ],
        [
            combo("intervalo_realizacion", "Realización (fin)", OPCIONES_INTERVALO),
            fecha("fecha_realizacion_desde", "Desde"),
            fecha("fecha_realizacion_hasta", "Hasta"),
        ],
        [
            combo("estado", "Estado", ESTADOS),
            { id: "solo_sin_terminar", label: "Solo sin terminar (pendientes, en curso y en pausa)", tipo: "casilla" },
        ],
        [propio("orden_id", "Orden", ControlOrden), propio("lote_id", "Lote", ControlLote)],
        [propio("cliente_id", "Cliente", ControlCliente), propio("pedido_id", "Pedido", ControlPedido)],
        [propio("tipo_centro_id", "Tipo de centro", ControlTipoCentro), propio("centro_id", "Centro de coste", ControlCentro)],
        [combo("orden1", "Ordenar por (1)", ORDENES1), combo("tipo_orden1", "Orden", SENTIDOS)],
        [combo("orden2", "Ordenar por (2)", ORDENES2), combo("tipo_orden2", "Orden", SENTIDOS)],
        [combo("orden3", "Ordenar por (3)", ORDENES3), combo("tipo_orden3", "Orden", SENTIDOS)],
    ],
    inicial: {
        formato: "Sin agrupar",
        intervalo_prevista: "",
        intervalo_realizacion: "",
        estado: "Todos",
        solo_sin_terminar: false,
        orden1: "No ordenar",
        tipo_orden1: "Ascendente",
        orden2: "No ordenar",
        tipo_orden2: "Ascendente",
        orden3: "No ordenar",
        tipo_orden3: "Ascendente",
    },
    ajustar: (ficha, campo) => ajustarInformeTareas(ficha, campo),
    Resultado: ResultadoInformeTareas,
};
