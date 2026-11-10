import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { EstadoLinea, LineaPedidoVenta } from "../diseño.ts";
import { ESTILO_DISPONIBILIDAD } from "../dominio.ts";
import "./TabLineas.css";

const metaTablaLineas = (estados: Record<string, EstadoLinea>): MetaTabla<LineaPedidoVenta> => ({
    cols: [
        { id: "referencia", cabecera: "Ref." },
        { id: "descripcion", cabecera: "Descripción", tipo: "texto" },
        { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
        { id: "servida", cabecera: "Servida", tipo: "numero" },
        {
            id: "pendiente",
            cabecera: "Pendiente",
            tipo: "numero",
            render: (l) => (l.cerrada ? "" : String(Math.max(l.cantidad - l.servida, 0))),
        },
        {
            id: "stock",
            cabecera: "Stock",
            render: (l) => {
                const estado = estados[l.id];
                if (!estado) return null;
                const { label, color } = ESTILO_DISPONIBILIDAD[estado.estado];
                return <span style={{ color, fontWeight: 600 }}>{label}</span>;
            },
        },
        { id: "cerrada", cabecera: "Cerrada", tipo: "booleano" },
    ],
});

export const TabLineas = ({
    lineas,
    estados,
    lineaActiva,
    onSeleccion,
}: {
    lineas: LineaPedidoVenta[];
    estados: Record<string, EstadoLinea>;
    lineaActiva: LineaPedidoVenta | null;
    onSeleccion: (linea: LineaPedidoVenta) => void;
}) => {
    return (
        <div className="TabLineasPedidoVenta">
            <ListadoSemiControlado
                metaTabla={metaTablaLineas(estados)}
                entidades={lineas}
                totalEntidades={lineas.length}
                cargando={false}
                seleccionada={lineaActiva}
                onSeleccion={onSeleccion}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
            />
        </div>
    );
};
