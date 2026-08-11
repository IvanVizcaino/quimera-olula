import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { StockUbicacion } from "../../../diseño.ts";

const metaTablaStocks: MetaTabla<StockUbicacion> = [
    { id: "articulo", cabecera: "Artículo" },
    { id: "cantidadFisica", cabecera: "Cantidad física", tipo: "numero" },
];

export const StocksUbicacion = ({ stocks }: { stocks: StockUbicacion[] }) => {
    return (
        <ListadoSemiControlado
            metaTabla={metaTablaStocks}
            entidades={stocks}
            totalEntidades={stocks.length}
            cargando={false}
            seleccionada={null}
            onSeleccion={() => {}}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};
