import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import {
    cambiarCriteriaUbicaciones,
    cargarContexto,
    onPasilloBorrado,
    onPasilloCambiado,
    onPasilloCreado,
    Pasillos,
    refrescarUbicaciones,
    refrescarZona,
} from "./dominio.ts";
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
        pasillo_seleccionado: [Pasillos.activar],
        alta_pasillo_solicitada: "CREANDO_PASILLO",
        cambio_pasillo_solicitado: "CAMBIANDO_PASILLO",
        baja_pasillo_solicitada: "BORRANDO_PASILLO",
        generar_ubicaciones_solicitado: "GENERANDO_UBICACIONES",
        criteria_ubicaciones_cambiada: [cambiarCriteriaUbicaciones],
        zona_deseleccionada: [publicar("zona_deseleccionada", null)],
    },
    BORRANDO: {
        zona_borrada: [publicar("zona_borrada", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
    CREANDO_PASILLO: {
        pasillo_creado: [onPasilloCreado, "ABIERTO"],
        alta_de_pasillo_cancelada: "ABIERTO",
    },
    CAMBIANDO_PASILLO: {
        pasillo_cambiado: [onPasilloCambiado, "ABIERTO"],
        cambio_de_pasillo_cancelado: "ABIERTO",
    },
    BORRANDO_PASILLO: {
        pasillo_borrado: [onPasilloBorrado, "ABIERTO"],
        borrado_de_pasillo_cancelado: "ABIERTO",
    },
    GENERANDO_UBICACIONES: {
        ubicaciones_generadas: [refrescarUbicaciones, "ABIERTO"],
        generacion_cancelada: "ABIERTO",
    },
});
