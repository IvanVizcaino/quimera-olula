import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useEffect } from "react";
import { ItemPedidoVenta } from "../diseño.ts";
import { contextoDetallePedidoVentaInicial } from "./detalle.ts";
import "./DetallePedidoVenta.css";
import { getMaquina } from "./maquina.ts";
import { TabLineas } from "./TabLineas.tsx";

export const DetallePedidoVenta = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePedidoVentaInicial, publicar);

    useEffect(() => {
        emitir("pedido_id_cambiado", id, true);
    }, [id]);

    if (!ctx.pedido.id) return null;

    const titulo = (p: ItemPedidoVenta) => `${p.codigo} — ${p.cliente}`;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.pedido}
            cerrarDetalle={() => emitir("pedido_deseleccionado", null, true)}
        >
            <div className="DetallePedidoVenta">
                <dl>
                    <dt>Código</dt>
                    <dd>{ctx.pedido.codigo}</dd>
                    <dt>Cliente</dt>
                    <dd>{ctx.pedido.cliente}</dd>
                    <dt>Fecha</dt>
                    <dd>{ctx.pedido.fecha.toLocaleDateString()}</dd>
                    {ctx.pedido.observaciones && (
                        <>
                            <dt>Observaciones</dt>
                            <dd>{ctx.pedido.observaciones}</dd>
                        </>
                    )}
                </dl>

                <Tabs children={[
                    <Tab
                        label="Líneas"
                        key="tab-lineas"
                        children={
                            <TabLineas lineas={ctx.pedido.lineas} />
                        }
                    />,
                ]} />
            </div>
        </Detalle>
    );
};
