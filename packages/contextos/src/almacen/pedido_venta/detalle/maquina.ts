import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { abrirPedidoCompetidor, activarLinea, cargarContexto, cerrarPedidoCompetidor } from "./detalle.ts";
import { ContextoDetallePedidoVenta, EstadoDetallePedidoVenta } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetallePedidoVenta, ContextoDetallePedidoVenta> = () => {
    return {
        INICIAL: {
            pedido_id_cambiado: [cargarContexto],
            pedido_deseleccionado: [
                publicar("pedido_deseleccionado", null),
            ],
        },
        ABIERTO: {
            pedido_id_cambiado: [cargarContexto],
            linea_seleccionada: [activarLinea],
            pedido_competidor_solicitado: [abrirPedidoCompetidor],
            pedido_deseleccionado: [
                publicar("pedido_deseleccionado", null),
            ],
        },
        VIENDO_PEDIDO_COMPETIDOR: {
            pedido_id_cambiado: [cargarContexto],
            pedido_competidor_cerrado: [cerrarPedidoCompetidor],
        },
    };
};
