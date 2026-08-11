import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoPedido, EstadoPedido } from "./diseño.ts";
import {
    abiertoOServido,
    activarLinea,
    borrarLinea,
    borrarPedido,
    cambiarCantidadLinea,
    cambiarCliente,
    cambiarDescuento,
    cambiarLinea,
    cambiarPedido,
    cancelarCambioPedido,
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

            alta_linea_solicitada: "CREANDO_LINEA",

            baja_linea_solicitada: "BORRANDO_LINEA",

            cambio_linea_solicitado: "CAMBIANDO_LINEA",

            borrar_solicitado: "BORRANDO_PEDIDO",

            cambio_cliente_solicitado: "CAMBIANDO_CLIENTE",

            descuento_solicitado: "CAMBIANDO_DESCUENTO",

            pedido_cargado: [abiertoOServido],

            pedido_cambiado: [refrescarPedido],

            edicion_de_pedido_lista: [cambiarPedido],

            edicion_de_pedido_cancelada: [cancelarCambioPedido],

            linea_seleccionada: [activarLinea],

            cliente_cambiado: [cambiarCliente],

            cambio_cantidad_linea_solicitado: cambiarCantidadLinea,

            pedido_deseleccionado: [
                getContextoVacio,
                publicar('pedido_deseleccionado', null)
            ]
        },

        SERVIDO: {

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

        CAMBIANDO_CLIENTE: {

            cambio_cliente_listo: cambiarCliente,

            cambio_cliente_cancelado: "ABIERTO",
        },

        CAMBIANDO_DESCUENTO: {

            descuento_aplicado: [cambiarDescuento],

            descuento_cancelado: "ABIERTO",
        },

        CREANDO_LINEA: {

            alta_linea_lista: [crearLinea],

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

    }
}
