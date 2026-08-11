import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoDetalleArticulo, EstadoDetalleArticulo } from "./diseño.ts";
import { cargarArticulo, getContextoVacio } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoDetalleArticulo, ContextoDetalleArticulo> = () => ({
    INICIAL: {
        articulo_id_cambiado: cargarArticulo,
    },
    ABIERTO: {
        articulo_id_cambiado: cargarArticulo,
        articulo_deseleccionado: [
            getContextoVacio,
            publicar("articulo_deseleccionado", null),
        ],
    },
});
