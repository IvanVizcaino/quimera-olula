import { urlFicha } from "#/almacen/comun/fichas.ts";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { LineaPedidoCompra } from "../diseño.ts";
import "./TabLineas.css";

const metaTablaLineas: MetaTabla<LineaPedidoCompra> = {
    cols: [
        { id: "sku", cabecera: "SKU", enlace: (l) => urlFicha.articulo(l.sku) },
        { id: "descripcion", cabecera: "Descripción", tipo: "texto" },
        { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
        { id: "cantidadRecibida", cabecera: "Recibida", tipo: "numero" },
        { id: "cerrada", cabecera: "Cerrada", tipo: "booleano" },
    ],
};

export const TabLineas = ({ lineas }: { lineas: LineaPedidoCompra[] }) => {
    return (
        <div className="TabLineas">
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
