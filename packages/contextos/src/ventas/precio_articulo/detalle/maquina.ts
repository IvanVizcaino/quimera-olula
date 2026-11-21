import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoPreciosArticulo, EstadoPreciosArticulo } from "./diseño.ts";
import { cargar, onBorrado, onCambiado, onCreado, Precios } from "./precios_articulo.ts";

export const getMaquina: () => Maquina<EstadoPreciosArticulo, ContextoPreciosArticulo> = () => ({
    INICIAL: {
        cliente_id_cambiado: [cargar],
    },

    ABIERTO: {
        cliente_id_cambiado: [cargar],
        precio_seleccionado: [Precios.activar],
        alta_solicitada: "CREANDO",
        cambio_solicitado: "CAMBIANDO",
        borrado_solicitado: "BORRANDO",
    },

    CREANDO: {
        precio_creado: [onCreado, "ABIERTO"],
        alta_cancelada: "ABIERTO",
    },

    CAMBIANDO: {
        precio_cambiado: [onCambiado, "ABIERTO"],
        cambio_cancelado: "ABIERTO",
    },

    BORRANDO: {
        precio_borrado: [onBorrado, "ABIERTO"],
        borrado_cancelado: "ABIERTO",
    },
});
