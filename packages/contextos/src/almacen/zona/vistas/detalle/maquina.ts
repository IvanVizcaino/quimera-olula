import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarZona } from "./dominio.ts";
import { ContextoDetalleZona, EstadoDetalleZona } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleZona, ContextoDetalleZona> = () => ({
    INICIAL: {
        zona_id_cambiada: [cargarContexto],
        zona_deseleccionada: [publicar("zona_deseleccionada", null)],
    },
    ABIERTO: {
        zona_id_cambiada: [cargarContexto],
        zona_guardada: [refrescarZona],
        borrado_solicitado: "BORRANDO",
        zona_deseleccionada: [publicar("zona_deseleccionada", null)],
    },
    BORRANDO: {
        zona_borrada: [publicar("zona_borrada", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
});
