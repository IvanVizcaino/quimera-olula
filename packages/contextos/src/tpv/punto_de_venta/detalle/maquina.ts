import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoPuntoVentaTpv, EstadoPuntoVentaTpv } from "./diseño.ts";
import { cancelarEdicion, cargarContexto, refrescarPunto } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoPuntoVentaTpv, ContextoPuntoVentaTpv> = () => ({
    INICIAL: {
        punto_id_cambiado: [cargarContexto],
    },
    Editando: {
        punto_guardado: [refrescarPunto],
        cancelar_edicion: cancelarEdicion,
        borrar: "Borrando",
        cancelar_seleccion: publicar("seleccion_cancelada"),
    },
    Borrando: {
        borrado_cancelado: "Editando",
        punto_borrado: publicar("punto_borrado"),
    },
});
