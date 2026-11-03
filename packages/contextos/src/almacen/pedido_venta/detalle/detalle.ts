import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { pedidoVentaVacio } from "../dominio.ts";
import { getPedidoVenta } from "../infraestructura.ts";
import { ContextoDetallePedidoVenta, EstadoDetallePedidoVenta } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetallePedidoVenta, ContextoDetallePedidoVenta>;

export const contextoDetallePedidoVentaInicial: ContextoDetallePedidoVenta = {
    estado: "INICIAL",
    pedido: pedidoVentaVacio,
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", pedido: pedidoVentaVacio };
    }
    const pedido = await getPedidoVenta(id);
    return { ...contexto, estado: "ABIERTO", pedido };
};
