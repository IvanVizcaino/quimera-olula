import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ClaseAlmacenamiento } from "../diseño.ts";
import { cargarContexto, refrescarClase } from "./detalle.ts";

export type EstadoDetalleClaseAlmacenamiento = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleClaseAlmacenamiento = {
    estado: EstadoDetalleClaseAlmacenamiento;
    clase: ClaseAlmacenamiento;
};

export const getMaquina: () => Maquina<EstadoDetalleClaseAlmacenamiento, ContextoDetalleClaseAlmacenamiento> = () => ({
    INICIAL: {
        clase_almacenamiento_id_cambiado: [cargarContexto],
        clase_almacenamiento_deseleccionada: [publicar("clase_almacenamiento_deseleccionada", null)],
    },
    ABIERTO: {
        clase_almacenamiento_id_cambiado: [cargarContexto],
        clase_almacenamiento_guardada: [refrescarClase],
        borrado_solicitado: "BORRANDO",
        clase_almacenamiento_deseleccionada: [publicar("clase_almacenamiento_deseleccionada", null)],
    },
    BORRANDO: {
        clase_almacenamiento_borrada: [publicar("clase_almacenamiento_borrada", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
});
