import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useCallback, useState } from "react";
import { SelectorCentroCoste } from "../../centro_coste/SelectorCentroCoste.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { SelectorTipoProceso } from "../../tipo_proceso/SelectorTipoProceso.tsx";
import { columnasTareas } from "../ColumnasTarea.tsx";
import { DetalleTarea } from "../detalle/DetalleTarea.tsx";
import { TareaProduccion } from "../diseño.ts";
import { ESTADOS_TAREA, etiquetaEstadoTarea, filtroEstadosTarea, ORDEN_TAREAS_DEFECTO } from "../dominio.ts";
import { getTarea, getTareas } from "../infraestructura.ts";
import "./MaestroTareaProduccion.css";

const texto = (campo: string, operador: "=" | "~" = "~") =>
    (v: unknown) => (v ? [campo, operador, String(v).trim()] as [string, string, string] : null);

const metaFiltro: MetaFiltro = {
    estado: {
        id: "estado",
        label: "Estado",
        tipo: "multiseleccion",
        opciones: ESTADOS_TAREA,
        filtro: (valor) => filtroEstadosTarea((valor as string[]) ?? []),
    },
    orden_id: { id: "orden_id", label: "Orden", tipo: "texto", filtro: texto("orden_id") },
    tipo_proceso_id: {
        id: "tipo_proceso_id",
        label: "Tipo de proceso",
        filtro: texto("tipo_proceso_id", "="),
        render: (valor, onChange) => (
            <SelectorTipoProceso valor={(valor as string) ?? ""} onChange={(opcion) => onChange(opcion?.valor ?? "")} />
        ),
    },
    centro_id: {
        id: "centro_id",
        label: "Centro de coste",
        filtro: texto("centro_id", "="),
        render: (valor, onChange) => (
            <SelectorCentroCoste valor={(valor as string) ?? ""} onChange={(opcion) => onChange(opcion?.valor ?? "")} />
        ),
    },
    articulo_id: { id: "articulo_id", label: "Artículo", tipo: "texto", filtro: texto("articulo_id") },
    lote_id: { id: "lote_id", label: "Lote", tipo: "texto", filtro: texto("lote_id") },
};

/** Las órdenes más recientes primero y, en cada una, sus tareas por orden en el proceso. */
const criteriaBase: Criteria = { ...criteriaDefecto, orden: ORDEN_TAREAS_DEFECTO };

const consultas = { getUno: getTarea, getLista: getTareas };

/**
 * Producción > Tareas de producción: las tareas de los procesos lanzados, con filtros y sus
 * acciones por fila (base del Terminal de F7). Tras cada acción se recarga la lista (una
 * acción cambia también otras tareas: terminar activa las siguientes) y el detalle.
 */
export const MaestroTareaProduccion = () => {
    const [version, setVersion] = useState(0);
    const tras = useCallback((recargar: () => Promise<void>) => async () => {
        await recargar();
        setVersion((v) => v + 1);
    }, []);

    return (
        <MaestroSimple<TareaProduccion>
            clase="MaestroTareaProduccion"
            titulo="Tareas de producción"
            metaTabla={(recargar) => columnasTareas({ conOrden: true, trasAccion: tras(recargar) })}
            metaFiltro={metaFiltro}
            consultas={consultas}
            criteriaBase={criteriaBase}
            tarjeta={(t) => (
                <div key={t.id}>
                    <div>{t.id} · {t.descripcion} <EtiquetaEstado {...etiquetaEstadoTarea(t.estado)} /></div>
                    <div>{t.ordenId} · {t.articuloId} {t.loteId}</div>
                </div>
            )}
            detalle={(id, publicar, recargar) => (
                <DetalleTarea
                    id={id}
                    version={version}
                    trasAccion={tras(recargar)}
                    cerrar={() => publicar("entidad_deseleccionada", null)}
                />
            )}
        />
    );
};
