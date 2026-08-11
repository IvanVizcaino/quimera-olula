import { metaNuevoPedido } from "#/ventas/pedido/crear/crear.ts";
import ApiUrls from "#/ventas/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { MetaModelo } from "@olula/lib/dominio.js";

export type NuevoPedidoNrj = {
    cliente_id: string;
    direccion_id: string;
    empresa_id: string;
    portes_cliente: boolean;
    transportista_id: string;
};

export const nuevoPedidoNrjVacio: NuevoPedidoNrj = {
    cliente_id: "",
    direccion_id: "",
    empresa_id: "1",
    portes_cliente: false,
    transportista_id: "",
};

export const metaNuevoPedidoNrj: MetaModelo<NuevoPedidoNrj> = {
    campos: {
        ...metaNuevoPedido.campos,
        portes_cliente: { tipo: "checkbox", requerido: false },
        transportista_id: { tipo: "texto", requerido: false },
    },
};

const baseUrl = new ApiUrls().PEDIDO;

export const postPedidoNrj = async (pedido: NuevoPedidoNrj): Promise<string> => {
    const payload = {
        cliente: {
            cliente_id: pedido.cliente_id,
            direccion_id: pedido.direccion_id,
        },
        empresa_id: pedido.empresa_id,
        transportista_id: pedido.transportista_id,
        portes_cliente: pedido.portes_cliente,
    };
    return await RestAPI.post(baseUrl, payload, "Error al crear pedido").then((respuesta) => respuesta.id);
};