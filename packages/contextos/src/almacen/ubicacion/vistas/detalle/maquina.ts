import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoUbicacion, EstadoUbicacion } from "./diseño.ts";
import { cargarContexto, refrescarUbicacion } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoUbicacion, ContextoUbicacion> = () => ({
    INICIAL: {
        ubicacion_id_cambiada: [cargarContexto],
        ubicacion_deseleccionada: publicar("ubicacion_deseleccionada", null),
    },
    ABIERTO: {
        ubicacion_id_cambiada: [cargarContexto],
        ubicacion_guardada: [refrescarUbicacion],
        borrado_solicitado: "BORRANDO",
        ubicacion_deseleccionada: publicar("ubicacion_deseleccionada", null),
    },
    BORRANDO: {
        borrado_cancelado: "ABIERTO",
        ubicacion_borrada: [publicar("ubicacion_borrada", null), "INICIAL"],
    },
});
