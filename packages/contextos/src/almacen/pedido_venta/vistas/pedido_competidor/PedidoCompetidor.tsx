import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { TabLineas } from "../../detalle/TabLineas.tsx";
import { PedidoConEstadoLineas } from "../../detalle/diseño.ts";

export const PedidoCompetidor = ({
    pedidoCompetidor,
    publicar,
}: {
    pedidoCompetidor: PedidoConEstadoLineas;
    publicar: EmitirEvento;
}) => {
    const { pedido, estadoLineas } = pedidoCompetidor;

    return (
        <QModal
            abierto={true}
            nombre="pedidoCompetidorPedidoVenta"
            titulo={`Pedido ${pedido.codigo} — ${pedido.cliente} (${pedido.fecha.toLocaleDateString()})`}
            onCerrar={() => publicar("pedido_competidor_cerrado")}
        >
            <TabLineas
                lineas={pedido.lineas}
                estados={estadoLineas}
                lineaActiva={null}
                onSeleccion={() => {}}
            />
        </QModal>
    );
};
