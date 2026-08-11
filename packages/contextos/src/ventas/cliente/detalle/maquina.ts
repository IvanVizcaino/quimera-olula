import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoCliente, EstadoCliente } from "./diseño.ts";
import {
    abiertoContexto,
    actualizarCuentaDomiciliada,
    asignarCuentaRemesaProceso,
    borrarCliente,
    cambiarCliente,
    cancelarCambioCliente,
    cargarContexto,
    darDeAltaClienteProceso,
    getContextoVacio,
    limpiarCuentaDomiciliada,
    refrescarCliente,
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoCliente, ContextoCliente> = () => {
    return {
        INICIAL: {
            cliente_id_cambiado: [cargarContexto],

            cliente_deseleccionado: [
                getContextoVacio,
                publicar("cliente_deseleccionado", null),
            ],
        },

        ABIERTO: {
            cliente_deseleccionado: [
                getContextoVacio,
                publicar("cliente_deseleccionado", null),
            ],

            cliente_cargado: [abiertoContexto],

            cliente_cambiado: [refrescarCliente],

            edicion_de_cliente_lista: [cambiarCliente],

            edicion_de_cliente_cancelada: [cancelarCambioCliente],

            baja_solicitada: "BAJANDO_CLIENTE",

            borrado_solicitado: "BORRANDO_CLIENTE",

            dar_de_alta_solicitado: [darDeAltaClienteProceso],

            cuenta_domiciliada: actualizarCuentaDomiciliada,

            cuenta_domiciliacion_desmarcada: limpiarCuentaDomiciliada,

            cuenta_remesa_seleccionada: asignarCuentaRemesaProceso,
        },

        BAJANDO_CLIENTE: {
            cliente_dado_de_baja: [refrescarCliente, "ABIERTO"],

            baja_cancelada: "ABIERTO",
        },

        BORRANDO_CLIENTE: {
            borrado_de_cliente_listo: borrarCliente,

            borrado_cancelado: "ABIERTO",
        },
    };
};
