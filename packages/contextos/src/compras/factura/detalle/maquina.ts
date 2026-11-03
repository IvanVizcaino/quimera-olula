import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import {
    cambiarRectificativa,
    cambiarDivisa,
    cambiarProveedor,
    cargarContexto,
    limpiarContexto,
    Lineas,
    onLineaBorrada,
    onLineaCambiada,
    onLineaCreada,
    refrescarFactura,
    registrarFacturaProceso,
} from "./detalle.ts";
import { ContextoDetalleFactura, EstadoDetalleFactura } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleFactura, ContextoDetalleFactura> = () => {
    return {
        INICIAL: {
            factura_id_cambiado: [cargarContexto],

            factura_deseleccionada: [
                limpiarContexto,
                publicar('factura_deseleccionada', null),
            ],
        },

        ABIERTO: {

            traza_solicitada: "VIENDO_TRAZA",

            factura_id_cambiado: [cargarContexto],

            factura_guardada: [refrescarFactura],

            factura_deseleccionada: [
                limpiarContexto,
                publicar('factura_deseleccionada', null),
            ],

            borrado_solicitado: "BORRANDO",

            cambio_proveedor_solicitado: "CAMBIANDO_PROVEEDOR",
            cambio_divisa_solicitado: "CAMBIANDO_DIVISA",

            registro_solicitado: "REGISTRANDO",

            cambio_rectificativa_solicitado: "CAMBIANDO_RECTIFICATIVA",

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

        BORRANDO: {
            factura_borrada: [
                publicar<EstadoDetalleFactura, ContextoDetalleFactura>(
                    'factura_borrada',
                    (contexto) => contexto.factura.id
                ),
                limpiarContexto,
            ],

            borrado_cancelado: "ABIERTO",
        },

        REGISTRANDO: {
            registro_listo: [registrarFacturaProceso],
            registro_cancelado: "ABIERTO",
        },

        CAMBIANDO_RECTIFICATIVA: {
            rectificativa_cambiada: [cambiarRectificativa],
            cambio_rectificativa_cancelado: "ABIERTO",
        },

        CREANDO_LINEA: {
            linea_creada: [onLineaCreada, "ABIERTO"],
            alta_de_linea_cancelada: "ABIERTO",
        },

        CAMBIANDO_LINEA: {
            linea_cambiada: [onLineaCambiada, "ABIERTO"],
            cambio_de_linea_cancelado: "ABIERTO",
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
