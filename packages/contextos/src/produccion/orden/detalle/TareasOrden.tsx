import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { TareaOrden } from "../diseño.ts";
import { etiquetaEstadoOrden } from "../dominio.ts";

const metaTabla: MetaTabla<TareaOrden> = [
    { id: "id", cabecera: "Tarea", estilo: "secundario", ancho: "20%" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
    { id: "estado", cabecera: "Estado", render: (t) => t.estado ? <EtiquetaEstado {...etiquetaEstadoOrden(t.estado)} /> : "" },
];

/** Tareas de la orden: las generará el motor de procesos al lanzarla (F5). */
export const TareasOrden = ({ tareas }: { tareas: TareaOrden[] }) =>
    tareas.length === 0 ? (
        <p className="nota-orden">La orden aún no tiene tareas: se generan al lanzarla a producción.</p>
    ) : (
        <QTabla<TareaOrden> metaTabla={metaTabla} datos={tareas} cargando={false} orden={[]} />
    );
