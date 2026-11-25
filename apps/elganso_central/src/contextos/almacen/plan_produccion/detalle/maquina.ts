import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import {
    anadirLineaRejilla, cambiarCantidadRejilla, cargarContexto, descartarRejilla,
    guardarRejilla, importarPegado, quitarLineaRejilla, refrescarCabecera,
} from "./detalle.ts";
import { ContextoDetallePlanProduccion, EstadoDetallePlanProduccion } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetallePlanProduccion, ContextoDetallePlanProduccion> = () => ({
    INICIAL: {
        plan_id_cambiado: [cargarContexto],
        plan_deseleccionado: [publicar('plan_deseleccionado', null)],
    },

    ABIERTO: {
        plan_id_cambiado: [cargarContexto],
        plan_guardado: [refrescarCabecera],
        plan_deseleccionado: [publicar('plan_deseleccionado', null)],
        borrado_solicitado: "BORRANDO",

        // Rejilla (edición en memoria hasta guardar)
        cantidad_cambiada: cambiarCantidadRejilla,
        linea_quitada: quitarLineaRejilla,
        linea_anadida_solicitada: anadirLineaRejilla,
        rejilla_descartada: descartarRejilla,
        rejilla_guardada_solicitada: guardarRejilla,
        pegar_excel_solicitado: "PEGANDO_EXCEL",
    },

    BORRANDO: {
        plan_borrado: [publicar('plan_borrado', null), "INICIAL"],
        borrado_de_plan_cancelado: "ABIERTO",
    },

    PEGANDO_EXCEL: {
        pegado_importado: [importarPegado, "ABIERTO"],
        pegado_cancelado: "ABIERTO",
    },
});
