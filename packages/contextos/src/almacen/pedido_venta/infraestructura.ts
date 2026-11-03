import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { ComprobarReservas, DisponibilidadPedido, GenerarSalidaDesdePedidos, GenerarSalidaVentaDesdePedidos, GetPedidoVenta, GetPedidosVenta, ItemPedidoVenta, LineaPedidoVenta, PedidoVenta } from "./diseño.ts";


interface ItemPedidoVentaApi {
    id: string;
    fecha: string;
    codigo: string;
    cliente: string;
}

interface PedidoVentaApi extends ItemPedidoVentaApi {
    nombre_cliente: string;
    observaciones: string;
}

interface LineaPedidoVentaApi {
    id: string;
    referencia: string;
    descripcion: string;
    cantidad: number;
    pvp_unitario: number;
    pvp_total: number;
    servida: number;
    cerrada: boolean;
}

interface OrdenDesdePedidosVentaApi {
    pedido_ids: number[];
    ubicacion_destino_id: number;
}

const baseUrl = `/almacen/pedido_venta`;

export const itemPedidoVentaDesdeApi = (api: ItemPedidoVentaApi): ItemPedidoVenta => ({
    id: api.id,
    fecha: new Date(Date.parse(api.fecha)),
    codigo: api.codigo,
    cliente: api.cliente,
});

const lineaPedidoVentaDesdeApi = (api: LineaPedidoVentaApi): LineaPedidoVenta => ({
    id: api.id,
    referencia: api.referencia,
    descripcion: api.descripcion,
    cantidad: api.cantidad,
    pvpUnitario: api.pvp_unitario,
    pvpTotal: api.pvp_total,
    servida: api.servida,
    cerrada: api.cerrada,
});

const pedidoVentaDesdeApi = (pedido: PedidoVentaApi, lineas: LineaPedidoVentaApi[]): PedidoVenta => ({
    ...itemPedidoVentaDesdeApi(pedido),
    cliente: pedido.nombre_cliente || pedido.cliente,
    observaciones: pedido.observaciones,
    lineas: lineas.map(lineaPedidoVentaDesdeApi),
});

export const getPedidoVenta: GetPedidoVenta = async (id) => {
    const [pedidoResp, lineasResp] = await Promise.all([
        RestAPI.get<{ datos: PedidoVentaApi }>(`/ventas/pedido/${id}`),
        RestAPI.get<{ datos: LineaPedidoVentaApi[] }>(`/ventas/pedido/${id}/linea`),
    ]);
    return pedidoVentaDesdeApi(pedidoResp.datos, lineasResp.datos);
};

export const getPedidosVenta: GetPedidosVenta = (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    return RestAPI.get<{ datos: ItemPedidoVentaApi[]; total: number }>(baseUrl + q).then((respuesta) => ({
        datos: respuesta.datos.map(itemPedidoVentaDesdeApi),
        total: respuesta.total,
    }));
};

export const generarSalidaDesdePedidos: GenerarSalidaDesdePedidos = async (pedidoIds, ubicacionDestinoId) => {
    const payload: OrdenDesdePedidosVentaApi = {
        pedido_ids: pedidoIds,
        ubicacion_destino_id: ubicacionDestinoId,
    };
    await RestAPI.post(
        `/almacen/orden/desde_pedidos_venta`,
        payload,
        "Error al generar salida desde pedidos de venta"
    );
};

interface SalidaVentaDesdePedidosApi {
    pedido_ids: number[];
    zonas: number[];
}

export const generarSalidaVentaDesdePedidos: GenerarSalidaVentaDesdePedidos = async (pedidoIds, zonas) => {
    const payload: SalidaVentaDesdePedidosApi = {
        pedido_ids: pedidoIds,
        zonas,
    };
    const respuesta = await RestAPI.post(
        `/almacen/orden/salida_desde_pedidos_venta`,
        payload,
        "Error al generar salida de venta desde pedidos"
    );
    return respuesta.id;
};

export const comprobarReservas: ComprobarReservas = async (zonas, limite) => {
    const respuesta = await RestAPI.query<{ zonas: number[]; limite: number }, { pedido_id: number; estado: DisponibilidadPedido }[]>(
        `${baseUrl}/comprobar_reservas`,
        { zonas, limite },
        'Error al comprobar reservas de pedidos'
    );
    return respuesta;
};
