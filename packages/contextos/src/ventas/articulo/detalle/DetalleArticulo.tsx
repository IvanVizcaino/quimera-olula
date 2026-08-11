import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Articulo } from "../diseño.ts";
import { articuloVacio } from "../dominio.ts";
import "./DetalleArticulo.css";
import { getMaquina } from "./maquina.ts";

const titulo = (articulo: Articulo) => articulo.descripcion;

export const DetalleArticulo = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const params = useParams();
    const articuloId = id ?? params.id;

    const { ctx, emitir } = useMaquina(
        getMaquina,
        { estado: "INICIAL", articulo: articuloVacio() },
        publicar
    );

    useEffect(() => {
        emitir("articulo_id_cambiado", articuloId, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [articuloId]);

    if (!ctx.articulo.id) return null;

    return (
        <div className="DetalleArticulo">
            <Detalle
                id={ctx.articulo.id}
                obtenerTitulo={titulo}
                setEntidad={() => {}}
                entidad={ctx.articulo}
                cerrarDetalle={() => emitir("articulo_deseleccionado", null)}
            >
                <Tabs
                    children={[
                        <Tab key="general" label="General">
                            <quimera-formulario>
                                <QInput label="Referencia" nombre="id" valor={ctx.articulo.id} soloTexto />
                                <QInput label="Descripción" nombre="descripcion" valor={ctx.articulo.descripcion} soloTexto />
                                <QInput label="Precio" nombre="precio" valor={String(ctx.articulo.precio)} soloTexto />
                                <QInput label="Grupo IVA" nombre="grupo_iva_producto_id" valor={ctx.articulo.grupo_iva_producto_id} soloTexto />
                            </quimera-formulario>
                        </Tab>,
                    ]}
                />
            </Detalle>
        </div>
    );
};
