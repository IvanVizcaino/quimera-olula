import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroPedido, EstadoMaestroPedido } from "./diseño.ts";
import { Pedidos, ampliarPedidos, recargarPedidos } from "./maestro.ts";


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
        },

        CREANDO_PEDIDO: {

            pedido_creado: [Pedidos.incluir, 'INICIAL'],

            creacion_pedido_cancelada: "INICIAL",
        },
    }
}
