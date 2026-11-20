import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PesoMedida } from "../diseño.ts";
import {
    ampliarPesosMedidas,
    PesosMedidas,
    incluirPesoMedidaCreadoPorId,
    recargarPesosMedidas,
} from "./maestro.ts";

export type EstadoMaestroPesoMedida = "INICIAL" | "CREANDO";

export type ContextoMaestroPesoMedida = {
    estado: EstadoMaestroPesoMedida;
    pesosMedidas: ListaActivaEntidades<PesoMedida>;
};

export const getMaquina: () => Maquina<EstadoMaestroPesoMedida, ContextoMaestroPesoMedida> = () => ({
    INICIAL: {
        peso_medida_seleccionada: [PesosMedidas.activar],
        peso_medida_deseleccionada: [PesosMedidas.desactivar],
        peso_medida_cambiada: [PesosMedidas.cambiar],
        peso_medida_borrada: [PesosMedidas.quitar],
        recarga_de_pesos_medidas_solicitada: recargarPesosMedidas,
        criteria_cambiado: [PesosMedidas.filtrar, recargarPesosMedidas],
        siguiente_pagina: [PesosMedidas.filtrar, ampliarPesosMedidas],
        crear_peso_medida_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_peso_medida_cancelada: "INICIAL",
        peso_medida_creada: incluirPesoMedidaCreadoPorId,
    },
});
