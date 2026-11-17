import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useState } from "react";
import { descripcionEstadoUbicacion } from "#/almacen/ubicacion/dominio.ts";
import { StockUbicacionItem, Ubicacion } from "#/almacen/ubicacion/diseño.ts";
import { getStocksUbicacion } from "#/almacen/ubicacion/infraestructura.ts";
import { StocksUbicacion } from "#/almacen/ubicacion/vistas/detalle/stocks/StocksUbicacion.tsx";

const metaTablaUbicaciones: MetaTabla<Ubicacion> = [
    { id: "codigo", cabecera: "Código" },
    { id: "pasillo", cabecera: "Pasillo" },
    { id: "modulo", cabecera: "Módulo" },
    { id: "nivel", cabecera: "Nivel" },
    { id: "hueco", cabecera: "Hueco" },
    { id: "tipoUbicacion", cabecera: "Tipo" },
    { id: "estado", cabecera: "Estado", render: (u) => descripcionEstadoUbicacion(u.estado) },
];

export const UbicacionesZona = ({
    ubicaciones,
}: {
    ubicaciones: Ubicacion[];
}) => {
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState<Ubicacion | null>(null);
    const [stocks, setStocks] = useState<StockUbicacionItem[]>([]);

    const seleccionarUbicacion = async (ubicacion: Ubicacion) => {
        setUbicacionSeleccionada(ubicacion);
        const stocksUbicacion = await getStocksUbicacion(ubicacion.id);
        setStocks(stocksUbicacion);
    };

    return (
        <div className="UbicacionesZona">
            <ListadoSemiControlado
                metaTabla={metaTablaUbicaciones}
                entidades={ubicaciones}
                totalEntidades={ubicaciones.length}
                cargando={false}
                seleccionada={ubicacionSeleccionada}
                onSeleccion={seleccionarUbicacion}
                criteriaInicial={criteriaDefecto}
                onCriteriaChanged={() => null}
                modo="tabla"
            />
            {ubicacionSeleccionada && (
                <div className="UbicacionesZona-stocks">
                    <h4>Stock de la ubicación</h4>
                    <StocksUbicacion stocks={stocks} />
                </div>
            )}
        </div>
    );
};
