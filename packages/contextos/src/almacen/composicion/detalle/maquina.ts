import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoComposicion, EstadoComposicion } from "./diseño.ts";
import { cancelarEdicion, cargarContexto, refrescarComposicion } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoComposicion, ContextoComposicion> = () => ({
    INICIAL: {
        composicion_id_cambiado: [cargarContexto],
    },
    Editando: {
        composicion_id_cambiado: [cargarContexto],
        composicion_guardada: [refrescarComposicion],
        cancelar_edicion: cancelarEdicion,
        generar_solicitada: "Generando",
        borrar: "Borrando",
        cancelar_seleccion: publicar("seleccion_cancelada"),
    },
    Generando: {
        generacion_cancelada: "Editando",
        composicion_generada: [refrescarComposicion],
    },
    Borrando: {
        borrado_cancelado: "Editando",
        composicion_borrada: publicar("composicion_borrada"),
    },
});
