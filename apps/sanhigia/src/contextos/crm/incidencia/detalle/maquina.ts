import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { cambiarIncidencia, cargarContexto, getContextoVacio } from "./detalle.ts";
import { ContextoDetalleIncidencia, EstadoDetalleIncidencia } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleIncidencia, ContextoDetalleIncidencia> = () => {
    return {
        INICIAL: {
            incidencia_id_cambiado: cargarContexto,

            incidencia_cambiada: cambiarIncidencia,

            edicion_incidencia_cancelada: [getContextoVacio, publicar("incidencia_deseleccionada", null)],

            borrado_incidencia_solicitado: "BORRANDO",

            crear_presupuesto_solicitado: 'CREANDO_PRESUPUESTO',
        },
        BORRANDO: {
            borrado_incidencia_cancelado: "INICIAL",

            incidencia_borrada: [getContextoVacio, publicar('incidencia_borrada', (_, incidenciaId) => incidenciaId)],
        },
        CREANDO_PRESUPUESTO: {
            presupuesto_creado: "INICIAL",

            creacion_presupuesto_cancelada: "INICIAL",
        },
    }
}
