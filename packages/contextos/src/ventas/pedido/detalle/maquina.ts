import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoPedido, EstadoPedido } from "./diseño.ts";
import {
    abiertoOServido,
    activarLinea,
    borrarLinea,
    borrarPedido,
    cambiarAgente,
    cambiarCantidadLinea,
    cambiarCliente,
    cambiarDescuento,
    cambiarDivisa,
    cambiarLinea,
    cambiarPedido,
    cancelarCambioPedido,
    cerrarPedido,
    cargarContexto,
    crearLinea,
    getContextoVacio,
    refrescarPedido
} from "./detalle.ts";


export const getMaquina = (): Maquina<EstadoPedido, ContextoPedido> => {

    return {

        INICIAL: {

            pedido_id_cambiado: [cargarContexto],

            pedido_deseleccionado: [
                getContextoVacio,
                publicar('pedido_deseleccionado', null)
            ]
        },

        ABIERTO: {

            traza_solicitada: "VIENDO_TRAZA",

            alta_linea_solicitada: "CREANDO_LINEA",

            baja_linea_solicitada: "BORRANDO_LINEA",

            cambio_linea_solicitado: "CAMBIANDO_LINEA",

            borrar_solicitado: "BORRANDO_PEDIDO",

            cierre_pedido_solicitado: "CERRANDO_PEDIDO",

            cambio_cliente_solicitado: "CAMBIANDO_CLIENTE",

            cambio_divisa_solicitado: "CAMBIANDO_DIVISA",

            cambio_agente_solicitado: "CAMBIANDO_AGENTE",

            descuento_solicitado: "CAMBIANDO_DESCUENTO",

            pedido_cargado: [abiertoOServido],

            pedido_cambiado: [refrescarPedido],

            edicion_de_pedido_lista: [cambiarPedido],

            edicion_de_pedido_cancelada: [cancelarCambioPedido],

            linea_seleccionada: [activarLinea],

            cambio_cantidad_linea_solicitado: cambiarCantidadLinea,

            pedido_deseleccionado: [
                getContextoVacio,
                publicar('pedido_deseleccionado', null)
            ]
        },

        SERVIDO: {

            traza_solicitada: "VIENDO_TRAZA",

            cierre_pedido_solicitado: "CERRANDO_PEDIDO",

            pedido_cargado: [abiertoOServido],

            pedido_deseleccionado: [
                getContextoVacio,
                publicar('pedido_deseleccionado', null)
            ]
        },

        BORRANDO_PEDIDO: {

            borrado_de_pedido_listo: borrarPedido,

            borrar_cancelado: "ABIERTO",
        },

        CERRANDO_PEDIDO: {

            cierre_pedido_listo: cerrarPedido,

            cierre_pedido_cancelado: [abiertoOServido],
        },

        CAMBIANDO_CLIENTE: {

            cambio_cliente_listo: cambiarCliente,

            cambio_cliente_cancelado: "ABIERTO",
        },

        CAMBIANDO_DIVISA: {

            cambio_divisa_listo: [cambiarDivisa],

            cambio_divisa_cancelado: "ABIERTO",
        },

        CAMBIANDO_AGENTE: {

            cambio_agente_listo: [cambiarAgente],

            cambio_agente_cancelado: "ABIERTO",
        },

        CAMBIANDO_DESCUENTO: {

            descuento_aplicado: [cambiarDescuento],

            descuento_cancelado: "ABIERTO",
        },

        CREANDO_LINEA: {

            linea_creada: crearLinea,

            crear_linea_cancelado: "ABIERTO",
        },

        CAMBIANDO_LINEA: {

            linea_actualizada: cambiarLinea,

            editar_linea_cancelado: "ABIERTO",
        },

        BORRANDO_LINEA: {

            linea_borrada: borrarLinea,

            borrar_linea_cancelado: "ABIERTO",
        },

        VIENDO_TRAZA: {

            traza_cerrada: [abiertoOServido],
        },
    }
}
