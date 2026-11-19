import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { MovimientosStockUbicacion } from "#/almacen/comun/componentes/MovimientosStockUbicacion.tsx";
import { StockUbicacionItem } from "../../../diseño.ts";

const ExpansionMovimientos = ({ entidad }: { entidad: StockUbicacionItem }) => (
    <MovimientosStockUbicacion stockUbicacionId={entidad.id} />
);

const metaTablaStocks: MetaTabla<StockUbicacionItem> = {
    cols: [
        { id: "articulo", cabecera: "Artículo" },
        { id: "cantidadFisica", cabecera: "Cantidad física", tipo: "numero" },
    ],
    expansion: ExpansionMovimientos,
};

export const StocksUbicacion = ({ stocks }: { stocks: StockUbicacionItem[] }) => {
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
