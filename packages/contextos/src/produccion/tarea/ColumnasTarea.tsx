import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { formatearCantidad } from "../orden/dominio.ts";
import { AccionesTarea } from "./acciones/AccionesTarea.tsx";
import "./acciones/AccionesTarea.css";
import { TareaProduccion } from "./diseño.ts";
import { duracion, etiquetaEstadoTarea, fechaHora, textoInicialFinal, textoTrabajador } from "./dominio.ts";

/**
 * Columnas de una rejilla de tareas con sus acciones. Los id son los campos de la API (con
 * ellos se ordena). Con `conOrden`, también la orden y el artículo del lote. Si es inicial o
 * final se indica bajo la descripción (la rejilla va en el panel de detalle y ha de ser estrecha); las acciones van tras el estado
 * para que se vean sin desplazar la rejilla.
 */
export const columnasTareas = ({
    conOrden = false,
    trasAccion,
}: {
    conOrden?: boolean;
    trasAccion: () => Promise<void> | void;
}): MetaTabla<TareaProduccion> => [
    { id: "id", cabecera: "Código", estilo: "secundario", prioridad: "alta" },
    ...(conOrden
        ? [
            { id: "orden_id", cabecera: "Orden", render: (t: TareaProduccion) => t.ordenId },
            {
                id: "articulo_id",
                cabecera: "Artículo / lote",
                render: (t: TareaProduccion) => (
                    <span title={t.articulo}>{[t.articuloId, t.loteId].filter(Boolean).join(" · ")}</span>
                ),
            },
        ]
        : []),
    {
        id: "descripcion",
        cabecera: "Descripción",
        estilo: "destacado",
        prioridad: "alta",
        render: (t) => (
            <span className="descripcion-tarea">
                {t.descripcion || t.codigo}
                {textoInicialFinal(t) && <small className="inicial-final">{textoInicialFinal(t)}</small>}
            </span>
        ),
    },
    {
        id: "estado",
        cabecera: "Estado",
        prioridad: "alta",
        render: (t) => <EtiquetaEstado {...etiquetaEstadoTarea(t.estado)} />,
    },
    {
        id: "acciones",
        cabecera: "Acciones",
        render: (t) => <AccionesTarea tarea={t} trasAccion={trasAccion} />,
    },
    { id: "realizada_por", cabecera: "Realizada por", render: textoTrabajador },
    { id: "dia_inicio", cabecera: "Inicio", render: (t) => fechaHora(t.diaInicio, t.tiempoInicio) },
    { id: "dia_fin", cabecera: "Fin", render: (t) => fechaHora(t.diaFin, t.tiempoFin) },
    {
        id: "tiempo_invertido",
        cabecera: "Tiempo invertido",
        render: (t) => (
            <span title={t.diaFin && t.intervalo !== null ? `Duración ${duracion(t.intervalo)}` : undefined}>
                {formatearCantidad(t.tiempoInvertido)}
            </span>
        ),
    },
];
