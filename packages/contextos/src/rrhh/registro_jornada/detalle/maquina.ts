import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { PausaJornada } from "../diseño.ts";
import { ContextoDetalleJornada, EstadoDetalleJornada } from "./diseño.ts";
import {
    anularJornada,
    cargarContexto,
    determinarEstado,
    getContextoVacio,
    refrescarJornada,
} from "./dominio.ts";

const activarPausa = async (
    contexto: ContextoDetalleJornada,
    payload: unknown
): Promise<ContextoDetalleJornada> => ({
    ...contexto,
    pausaActiva: payload as PausaJornada,
});

const desactivarPausa = async (
    contexto: ContextoDetalleJornada
): Promise<ContextoDetalleJornada> => ({
    ...contexto,
    pausaActiva: null,
});

export const getMaquina: () => Maquina<EstadoDetalleJornada, ContextoDetalleJornada> = () => {
    return {
        INICIAL: {
            id_jornada_cambiado: [cargarContexto],

            jornada_deseleccionada: [
                getContextoVacio,
                publicar('jornada_deseleccionada', null),
            ],
        },

        BORRADOR: {
            jornada_guardada: [refrescarJornada],

            jornada_cambiada: [refrescarJornada],

            aprobar_solicitado: "APROBANDO",

            anular_solicitado: "ANULANDO",

            crear_pausa_solicitado: "CREANDO_PAUSA",

            editar_pausa_solicitado: [activarPausa, "EDITANDO_PAUSA"],

            borrar_pausa_solicitado: [activarPausa, "BORRANDO_PAUSA"],
        },

        APROBADA: {
            jornada_cambiada: [refrescarJornada],

            anular_solicitado: "ANULANDO",
        },

        ANULADA: {
            jornada_cambiada: [refrescarJornada],
        },

        APROBANDO: {
            jornada_aprobada: [refrescarJornada, determinarEstado],

            aprobacion_cancelada: "BORRADOR",
        },

        ANULANDO: {
            jornada_anulada: [anularJornada],

            anulacion_cancelada: [determinarEstado],
        },

        CREANDO_PAUSA: {
            pausa_creada: [refrescarJornada, determinarEstado],

            creacion_pausa_cancelada: "BORRADOR",
        },

        EDITANDO_PAUSA: {
            pausa_editada: [desactivarPausa, refrescarJornada, determinarEstado],

            edicion_pausa_cancelada: [desactivarPausa, "BORRADOR"],
        },

        BORRANDO_PAUSA: {
            pausa_borrada: [desactivarPausa, refrescarJornada, determinarEstado],

            borrado_pausa_cancelado: [desactivarPausa, "BORRADOR"],
        },
    };
};
