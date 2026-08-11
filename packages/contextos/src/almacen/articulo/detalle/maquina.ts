import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoArticulo, EstadoArticulo } from "./diseño.ts";
import {
    borrarArticulo,
    cancelarCambioArticulo,
    cargarContexto,
    getContextoVacio,
    guardarArticulo,
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoArticulo, ContextoArticulo> = () => ({
    INICIAL: {
        articulo_id_cambiado: [cargarContexto],

        articulo_deseleccionado: [
            getContextoVacio,
            publicar("articulo_deseleccionado", null),
        ],
    },

    ABIERTO: {
        articulo_id_cambiado: [cargarContexto],

        articulo_deseleccionado: [
            getContextoVacio,
            publicar("articulo_deseleccionado", null),
        ],

        articulo_cambiado: [cancelarCambioArticulo],

        edicion_de_articulo_lista: [guardarArticulo],

        edicion_de_articulo_cancelada: [cancelarCambioArticulo],

        borrado_solicitado: "BORRANDO_ARTICULO",
    },

    BORRANDO_ARTICULO: {
        borrado_de_articulo_listo: borrarArticulo,

        borrado_cancelado: "ABIERTO",
    },
});
