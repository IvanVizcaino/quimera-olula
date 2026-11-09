import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { estadosPorLinea, pedidoVentaVacio } from "../dominio.ts";
import { comprobarReservasLineas, getPedidoVenta } from "../infraestructura.ts";
import {
    CargaDetallePedidoVenta,
    ContextoDetallePedidoVenta,
    EstadoDetallePedidoVenta,
    PedidoConEstadoLineas,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetallePedidoVenta, ContextoDetallePedidoVenta>;

export const contextoDetallePedidoVentaInicial: ContextoDetallePedidoVenta = {
    estado: "INICIAL",
    pedido: pedidoVentaVacio,
    estadoLineas: {},
    zonas: [],
    lineaActiva: null,
    pedidoCompetidor: null,
};

const cargarPedidoConEstadoLineas = async (id: string, zonas: number[]): Promise<PedidoConEstadoLineas> => {
    const [pedido, estados] = await Promise.all([
        getPedidoVenta(id),
        zonas.length > 0 ? comprobarReservasLineas(id, zonas) : Promise.resolve([]),
    ]);
    return { pedido, estadoLineas: estadosPorLinea(estados) };
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const { id, zonas } = payload as CargaDetallePedidoVenta;
    if (!id) {
        return contextoDetallePedidoVentaInicial;
    }
    const cargado = await cargarPedidoConEstadoLineas(id, zonas);
    const lineaActiva = contexto.pedido.id === id ? contexto.lineaActiva : null;
    return {
        ...contexto,
        ...cargado,
        estado: "ABIERTO",
        zonas,
        lineaActiva,
        pedidoCompetidor: null,
    };
};

export const activarLinea: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    lineaActiva: payload as string,
});

export const abrirPedidoCompetidor: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    estado: "VIENDO_PEDIDO_COMPETIDOR",
    pedidoCompetidor: await cargarPedidoConEstadoLineas(payload as string, contexto.zonas),
});

export const cerrarPedidoCompetidor: ProcesarDetalle = async (contexto) => ({
    ...contexto,
    estado: "ABIERTO",
    pedidoCompetidor: null,
});
