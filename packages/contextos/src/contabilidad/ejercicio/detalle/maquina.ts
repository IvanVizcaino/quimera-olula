import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarEjercicio } from "./detalle.ts";
import { ContextoDetalleEjercicio, EstadoDetalleEjercicio } from "./diseño.ts";

const volver = { cancelado: "ABIERTO" as const };

export const getMaquina: () => Maquina<EstadoDetalleEjercicio, ContextoDetalleEjercicio> = () => ({
    INICIAL: {
        ejercicio_id_cambiada: [cargarContexto],
        ejercicio_deseleccionado: [publicar("ejercicio_deseleccionado", null)],
    },

    ABIERTO: {
        ejercicio_id_cambiada: [cargarContexto],
        ejercicio_deseleccionado: [publicar("ejercicio_deseleccionado", null)],
        generar_pgc_solicitado: "GENERANDO_PGC",
        cierre_solicitado: "CERRANDO",
        deshacer_cierre_solicitado: "DESHACIENDO",
        ejercicio_actual_cambiado: [refrescarEjercicio],
        datos_guardados: [refrescarEjercicio],
    },

    GENERANDO_PGC: { ...volver, pgc_generado: [refrescarEjercicio] },
    CERRANDO: { ...volver, ejercicio_cerrado: [refrescarEjercicio] },
    DESHACIENDO: { ...volver, cierre_deshecho: [refrescarEjercicio] },
});
