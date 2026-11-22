import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { PartidaPlantilla, PlantillaAsiento } from "../diseño.ts";
import {
    cargarContexto,
    onPartidaBorrada,
    onPartidaCambiada,
    onPartidaCreada,
    Partidas,
    refrescarPlantilla,
} from "./detalle.ts";

export type EstadoDetallePlantillaAsiento =
    | "INICIAL"
    | "ABIERTO"
    | "BORRANDO"
    | "CREANDO_LINEA"
    | "CAMBIANDO_LINEA"
    | "BORRANDO_LINEA";

export type ContextoDetallePlantillaAsiento = {
    estado: EstadoDetallePlantillaAsiento;
    plantilla: PlantillaAsiento;
    partidas: ListaEntidades<PartidaPlantilla>;
};

export const getMaquina: () => Maquina<
    EstadoDetallePlantillaAsiento,
    ContextoDetallePlantillaAsiento
> = () => ({
    INICIAL: {
        plantilla_id_cambiado: [cargarContexto],
        plantilla_deseleccionada: [publicar("plantilla_deseleccionada", null)],
    },

    ABIERTO: {
        plantilla_guardada: [refrescarPlantilla],
        borrado_solicitado: "BORRANDO",
        plantilla_id_cambiado: [cargarContexto],
        alta_linea_solicitada: "CREANDO_LINEA",
        cambio_linea_solicitado: "CAMBIANDO_LINEA",
        baja_linea_solicitada: "BORRANDO_LINEA",
        linea_seleccionada: [Partidas.activar],
    },

    BORRANDO: {
        plantilla_borrada: [publicar("plantilla_borrada", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },

    CREANDO_LINEA: {
        linea_creada: [onPartidaCreada, "ABIERTO"],
        alta_de_linea_cancelada: "ABIERTO",
    },

    CAMBIANDO_LINEA: {
        linea_cambiada: [onPartidaCambiada, "ABIERTO"],
        cambio_de_linea_cancelado: "ABIERTO",
    },

    BORRANDO_LINEA: {
        linea_borrada: [onPartidaBorrada, "ABIERTO"],
        borrado_de_linea_cancelado: "ABIERTO",
    },
});
