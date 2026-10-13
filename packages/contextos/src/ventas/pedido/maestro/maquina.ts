import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroPedido, EstadoMaestroPedido } from "./diseño.ts";
import { Pedidos, albaranarPedidos, ampliarPedidos, recargarPedidos, recargarPedidosActuales } from "./maestro.ts";


export const getMaquina: () => Maquina<EstadoMaestroPedido, ContextoMaestroPedido> = () => {

    return {

        INICIAL: {

            pedido_cambiado: Pedidos.cambiar,

            pedido_seleccionado: [Pedidos.activar],

            pedido_deseleccionado: Pedidos.desactivar,

            pedido_borrado: Pedidos.quitar,

            pedido_creado: Pedidos.incluir,

            recarga_de_pedidos_solicitada: recargarPedidos,

            criteria_cambiado: [Pedidos.filtrar, recargarPedidos],

            siguiente_pagina: [Pedidos.filtrar, ampliarPedidos],

            crear_pedido_solicitado: "CREANDO_PEDIDO",

            seleccionados_cambiados: async (ctx, payload) => ({ ...ctx, seleccionados: payload as string[] }),

            albaranado_multiple_solicitado: "ALBARANANDO_PEDIDOS",

            cierre_hasta_fecha_solicitado: "CERRANDO_HASTA_FECHA",
        },

        CERRANDO_HASTA_FECHA: {

            pedidos_cerrados_hasta_fecha: [recargarPedidosActuales, "INICIAL"],

            cierre_hasta_fecha_cancelado: "INICIAL",
        },

        CREANDO_PEDIDO: {

            pedido_creado: [Pedidos.incluir, Pedidos.activar, 'INICIAL'],

            creacion_pedido_cancelada: "INICIAL",
        },

        ALBARANANDO_PEDIDOS: {

            pedidos_albaranados: [albaranarPedidos],

            albaranado_multiple_cancelado: "INICIAL",
        },

        ALBARANES_CREADOS: {

            resultado_albaranado_cerrado: "INICIAL",
        },
    }
}
