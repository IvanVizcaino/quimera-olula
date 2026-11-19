import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { TipoUbicacion } from "../diseño.ts";
import { cargarContexto, refrescarTipoUbicacion } from "./detalle.ts";

export type EstadoDetalleTipoUbicacion = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleTipoUbicacion = {
    estado: EstadoDetalleTipoUbicacion;
    tipoUbicacion: TipoUbicacion;
};

export const getMaquina: () => Maquina<EstadoDetalleTipoUbicacion, ContextoDetalleTipoUbicacion> = () => ({
    INICIAL: {
        tipo_ubicacion_id_cambiado: [cargarContexto],
        tipo_ubicacion_deseleccionado: [publicar("tipo_ubicacion_deseleccionado", null)],
    },
    ABIERTO: {
        tipo_ubicacion_id_cambiado: [cargarContexto],
        tipo_ubicacion_guardado: [refrescarTipoUbicacion],
        borrado_solicitado: "BORRANDO",
        tipo_ubicacion_deseleccionado: [publicar("tipo_ubicacion_deseleccionado", null)],
    },
    BORRANDO: {
        tipo_ubicacion_borrado: [publicar("tipo_ubicacion_borrado", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
});
