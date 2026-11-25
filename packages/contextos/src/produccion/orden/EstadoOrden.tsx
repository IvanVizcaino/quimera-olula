import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { OrdenProduccion } from "./diseño.ts";
import { etiquetaEstadoOrden, etiquetaLanzada } from "./dominio.ts";

/** Estado de la orden y, si está lanzada sin empezar, el indicador «Lanzada». */
export const EstadoOrden = ({ orden }: { orden: Pick<OrdenProduccion, "estado" | "lanzada"> }) => {
    const lanzada = etiquetaLanzada(orden);
    return (
        <span className="estado-orden">
            <EtiquetaEstado {...etiquetaEstadoOrden(orden.estado)} />
            {lanzada && <EtiquetaEstado {...lanzada} />}
        </span>
    );
};
