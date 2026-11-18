import { MovimientosStockUbicacion } from "#/almacen/comun/componentes/MovimientosStockUbicacion.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect } from "react";
import { Stock, StockUbicacion } from "../diseño.ts";
import { stockVacio } from "../dominio.ts";
import "./DetalleStock.css";
import { getMaquina } from "./maquina.ts";

const titulo = (stock: Stock) => stock.articulo as string;

const ExpansionMovimientos = ({ entidad }: { entidad: StockUbicacion }) => (
    <MovimientosStockUbicacion stockUbicacionId={entidad.id} />
);

const metaTablaUbicaciones: MetaTabla<StockUbicacion> = {
    cols: [
        { id: "ubicacion", cabecera: "Ubicación" },
        { id: "cantidad", cabecera: "Cantidad", tipo: "numero" },
    ],
    expansion: ExpansionMovimientos,
};

const UbicacionesStock = ({ ubicaciones }: { ubicaciones: StockUbicacion[] }) => (
    <details className="DetalleStock-ubicaciones">
        <summary>Ubicaciones ({ubicaciones.length})</summary>
        <ListadoSemiControlado
            metaTabla={metaTablaUbicaciones}
            entidades={ubicaciones}
            totalEntidades={ubicaciones.length}
            cargando={false}
            seleccionada={null}
            onSeleccion={() => {}}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    </details>
);

export const DetalleStock = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(
        getMaquina,
        {
            estado: "INICIAL",
            stock: { ...stockVacio },
        },
        publicar
    );

    useEffect(() => {
        emitir("stock_id_cambiado", id, true);
    }, [id]);

    if (!ctx.stock.id) return null;

    const { stock } = ctx;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={stock}
            cerrarDetalle={() => emitir("stock_deseleccionado", null, true)}
        >
            <div className="DetalleStock">
                <quimera-formulario>
                    <QInput label="Artículo"            nombre="articulo"           valor={stock.articulo ?? ""}                   soloLectura />
                    <QInput label="Referencia"            nombre="articulo_id"           valor={String(stock.articuloId ?? "")}                   soloLectura />
                    <QInput label="Almacén"             nombre="almacen"            valor={stock.almacen ?? ""}                    soloLectura />
                    <QInput label="Cantidad física"     nombre="cantidadFisica"     valor={String(stock.cantidadFisica ?? "")}     soloLectura tipo="numero" />
                    <QInput label="Cantidad disponible" nombre="cantidadDisponible" valor={String(stock.cantidadDisponible ?? "")} soloLectura tipo="numero"/>
                </quimera-formulario>
                <UbicacionesStock ubicaciones={stock.ubicaciones} />
            </div>
        </Detalle>
    );
};
