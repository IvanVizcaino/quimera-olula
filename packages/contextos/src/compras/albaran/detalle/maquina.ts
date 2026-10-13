import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import {
    borrarMovimientoLote,
    cambiarDivisa,
    cambiarProveedor,
    cargarContexto,
    crearMovimientoLote,
    facturarAlbaranProceso,
    limpiarContexto,
    Lineas,
    onLineaBorrada,
    onLineaCambiada,
    onLineaCreada,
    refrescarAlbaran,
} from "./detalle.ts";
import { ContextoDetalleAlbaran, EstadoDetalleAlbaran } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleAlbaran, ContextoDetalleAlbaran> = () => {
    return {
        INICIAL: {
            albaran_id_cambiado: [cargarContexto],

            albaran_deseleccionado: [
                limpiarContexto,
                publicar('albaran_deseleccionado', null),
            ],
        },

        ABIERTO: {

            traza_solicitada: "VIENDO_TRAZA",

            albaran_id_cambiado: [cargarContexto],

            albaran_guardado: [refrescarAlbaran],

            albaran_deseleccionado: [
                limpiarContexto,
                publicar('albaran_deseleccionado', null),
            ],

            borrado_solicitado: "BORRANDO",
            facturado_solicitado: "FACTURANDO",

            cambio_proveedor_solicitado: "CAMBIANDO_PROVEEDOR",
            cambio_divisa_solicitado: "CAMBIANDO_DIVISA",

            linea_seleccionada: [Lineas.activar],
            alta_linea_solicitada: "CREANDO_LINEA",
            cambio_linea_solicitado: "CAMBIANDO_LINEA",
            baja_linea_solicitada: "BORRANDO_LINEA",
        },

        CAMBIANDO_DIVISA: {
            cambio_divisa_listo: [cambiarDivisa],
            cambio_divisa_cancelado: "ABIERTO",
        },

        CAMBIANDO_PROVEEDOR: {
            cambio_proveedor_listo: [cambiarProveedor],
            cambio_proveedor_cancelado: "ABIERTO",
        },

        FACTURANDO: {
            facturado_confirmado: [facturarAlbaranProceso],
            facturado_cancelado: "ABIERTO",
        },

        FACTURA_CREADA: {
            resultado_facturado_cerrado: "ABIERTO",
        },

        BORRANDO: {
            albaran_borrado: [
                publicar<EstadoDetalleAlbaran, ContextoDetalleAlbaran>(
                    'albaran_borrado',
                    (contexto) => contexto.albaran.id
                ),
                limpiarContexto,
            ],

            borrado_cancelado: "ABIERTO",
        },

        CREANDO_LINEA: {
            linea_creada: [onLineaCreada, "ABIERTO"],
            alta_de_linea_cancelada: "ABIERTO",
        },

        CAMBIANDO_LINEA: {
            linea_cambiada: [onLineaCambiada, "ABIERTO"],
            cambio_de_linea_cancelado: "ABIERTO",
            crear_movimiento_lote_solicitado: [crearMovimientoLote, "CAMBIANDO_LINEA"],
            borrar_movimiento_lote_solicitado: [borrarMovimientoLote, "CAMBIANDO_LINEA"],
        },

        BORRANDO_LINEA: {
            linea_borrada: [onLineaBorrada, "ABIERTO"],
            borrado_de_linea_cancelado: "ABIERTO",
        },

        VIENDO_TRAZA: {

            traza_cerrada: "ABIERTO",
        },
    };
};
