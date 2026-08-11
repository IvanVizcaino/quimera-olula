import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { Stock } from "../diseño.ts";
import { stockVacio } from "../dominio.ts";
import "./DetalleStock.css";
import { getMaquina } from "./maquina.ts";

const titulo = (stock: Stock) => stock.articulo as string;

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
                    <QInput label="Artículo"            nombre="articulo"           valor={stock.articulo ?? ""}                   soloTexto />
                    <QInput label="Almacén"             nombre="almacen"            valor={stock.almacen ?? ""}                    soloTexto />
                    <QInput label="Cantidad física"     nombre="cantidadFisica"     valor={String(stock.cantidadFisica ?? "")}     soloTexto tipo="numero" />
                    <QInput label="Cantidad disponible" nombre="cantidadDisponible" valor={String(stock.cantidadDisponible ?? "")} soloTexto tipo="numero"/>
                </quimera-formulario>
            </div>
        </Detalle>
    );
};
