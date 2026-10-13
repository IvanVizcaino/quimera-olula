import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoUnidadMedida, EstadoUnidadMedida } from "./diseño.ts";
import { cancelarEdicion, cargarContexto, refrescarUnidadMedida } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoUnidadMedida, ContextoUnidadMedida> = () => ({
    INICIAL: {
        unidad_id_cambiado: [cargarContexto],
    },
    Editando: {
        unidad_guardada: [refrescarUnidadMedida],
        cancelar_edicion: cancelarEdicion,
        borrar: "Borrando",
        cancelar_seleccion: publicar("seleccion_cancelada"),
    },
    Borrando: {
        borrado_cancelado: "Editando",
        unidad_borrada: publicar("unidad_borrada"),
    },
});
