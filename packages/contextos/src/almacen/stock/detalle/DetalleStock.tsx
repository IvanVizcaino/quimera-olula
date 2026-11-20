import { MovimientosStockUbicacion } from "#/almacen/comun/componentes/MovimientosStockUbicacion.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearFechaString, formatearNumero } from "@olula/lib/dominio.ts";
import { useEffect } from "react";
import { Stock, StockUbicacion } from "../diseño.ts";
import { stockVacio } from "../dominio.ts";
import "./DetalleStock.css";
import { getMaquina } from "./maquina.ts";

const titulo = (stock: Stock) => stock.articulo as string;

const numero = (valor: number | null | undefined) =>
    valor === null || valor === undefined ? "" : formatearNumero(valor);

const fecha = (valor: string | null | undefined) =>
    valor ? formatearFechaString(valor) : "";

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
                    <QInput label="Artículo"     nombre="articulo"    valor={stock.articulo ?? ""}               soloLectura />
                    <QInput label="Referencia"   nombre="articulo_id" valor={String(stock.articuloId ?? "")}     soloLectura />
                    <QInput label="Almacén"      nombre="almacen_id"  valor={stock.almacenId ?? ""}              soloLectura />
                    <QInput label="N. Almacén"   nombre="almacen"     valor={stock.almacen ?? ""}                soloLectura />
                    <QInput label="Cantidad física"     nombre="cantidadFisica"     valor={numero(stock.cantidadFisica)}     soloLectura />
                    <QInput label="Disponible"          nombre="cantidadDisponible" valor={numero(stock.cantidadDisponible)} soloLectura />
                    <QInput label="Reservada"           nombre="cantidadReservada"  valor={numero(stock.cantidadReservada)}  soloLectura />
                    <QInput label="Pte. recibir"        nombre="cantidadPendiente"  valor={numero(stock.cantidadPendiente)}  soloLectura />
                    <QInput label="Necesidad"           nombre="necesidad"          valor={numero(stock.necesidad)}          soloLectura />
                    <QInput label="Stock mínimo"        nombre="stockMinimo"        valor={numero(stock.stockMinimo)}        soloLectura />
                    <QInput label="Stock máximo"        nombre="stockMaximo"        valor={numero(stock.stockMaximo)}        soloLectura />
                    <QInput label="Fecha últ. regularización" nombre="fechaUltReg"    valor={fecha(stock.fechaUltimaRegularizacion)}    soloLectura />
                    <QInput label="Hora últ. regularización"  nombre="horaUltReg"     valor={stock.horaUltimaRegularizacion?.slice(0, 8) ?? ""} soloLectura />
                    <QInput label="Cantidad últ. regularización" nombre="cantidadUltReg" valor={numero(stock.cantidadUltimaRegularizacion)} soloLectura />
                </quimera-formulario>
                <UbicacionesStock ubicaciones={stock.ubicaciones} />
            </div>
        </Detalle>
    );
};
