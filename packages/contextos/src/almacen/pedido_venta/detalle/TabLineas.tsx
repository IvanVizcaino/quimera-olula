import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { LineaPedidoVenta } from "../diseño.ts";
import "./TabLineas.css";

const metaTablaLineas: MetaTabla<LineaPedidoVenta> = {
    cols: [
        { id: "referencia", cabecera: "Ref." },
        { id: "descripcion", cabecera: "Descripción", tipo: "texto" },
        { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
        { id: "pvpUnitario", cabecera: "PVP Unit.", tipo: "numero" },
        { id: "pvpTotal", cabecera: "Total", tipo: "numero" },
        { id: "servida", cabecera: "Servida", tipo: "numero" },
        { id: "cerrada", cabecera: "Cerrada", tipo: "booleano" },
    ],
};

export const TabLineas = ({ lineas }: { lineas: LineaPedidoVenta[] }) => {
    return (
        <div className="TabLineasPedidoVenta">
            <ListadoSemiControlado
                metaTabla={metaTablaLineas}
                entidades={lineas}
                totalEntidades={lineas.length}
                cargando={false}
                seleccionada={null}
                onSeleccion={() => {}}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
            />
        </div>
    );
};
