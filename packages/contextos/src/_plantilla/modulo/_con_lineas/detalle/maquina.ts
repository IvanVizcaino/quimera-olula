import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { LineaModulo, ModLin } from "../diseño.js";
import {
    cargarContexto,
    Lineas,
    onLineaBorrada,
    onLineaCambiada,
    onLineaCreada,
    refrescarModLin,
} from "./detalle.js";

export type EstadoDetalleModLin =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO'
    | 'CREANDO_LINEA'
    | 'CAMBIANDO_LINEA'
    | 'BORRANDO_LINEA';

export type ContextoDetalleModLin = {
    estado: EstadoDetalleModLin;
    modLin: ModLin;
    lineas: ListaEntidades<LineaModulo>;
};

export const getMaquina: () => Maquina<EstadoDetalleModLin, ContextoDetalleModLin> = () => {
    return {
        INICIAL: {
            modulo_id_cambiado: [cargarContexto],
            modulo_deseleccionado: [
                publicar('modulo_deseleccionado', null),
            ],
        },

        ABIERTO: {
            modulo_guardado: [refrescarModLin],
            borrado_solicitado: "BORRANDO",
            modulo_id_cambiado: [cargarContexto],
            alta_linea_solicitada: "CREANDO_LINEA",
            cambio_linea_solicitado: "CAMBIANDO_LINEA",
            baja_linea_solicitada: "BORRANDO_LINEA",
            linea_seleccionada: [Lineas.activar],
        },

        BORRANDO: {
            modulo_borrado: [
                publicar('modulo_borrado', null),
                "INICIAL",
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
        },

        BORRANDO_LINEA: {
            linea_borrada: [onLineaBorrada, "ABIERTO"],
            borrado_de_linea_cancelado: "ABIERTO",
        },
    };
};
