import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarZonaGeografica } from "./detalle.ts";
import { ContextoDetalleZonaGeografica, EstadoDetalleZonaGeografica } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleZonaGeografica, ContextoDetalleZonaGeografica> = () => {
    return {
        INICIAL: {
            zona_geografica_id_cambiado: [cargarContexto],
            zona_geografica_deseleccionado: [publicar("zona_geografica_deseleccionado", null)],
        },

        ABIERTO: {
            zona_geografica_guardado: [refrescarZonaGeografica],
            borrado_solicitado: "BORRANDO",
            zona_geografica_id_cambiado: [cargarContexto],
            zona_geografica_deseleccionado: [publicar("zona_geografica_deseleccionado", null)],
        },

        BORRANDO: {
            zona_geografica_borrado: [publicar("zona_geografica_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
