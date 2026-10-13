import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoPeriodoIva, EstadoPeriodoIva } from "./diseño.ts";
import { cancelarEdicion, cargarContexto, refrescarPeriodoIva } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoPeriodoIva, ContextoPeriodoIva> = () => ({
    INICIAL: {
        periodo_id_cambiado: [cargarContexto],
    },
    Editando: {
        periodo_guardado: [refrescarPeriodoIva],
        cancelar_edicion: cancelarEdicion,
        borrar: "Borrando",
        cancelar_seleccion: publicar("seleccion_cancelada"),
    },
    Borrando: {
        borrado_cancelado: "Editando",
        periodo_borrado: publicar("periodo_borrado"),
    },
});
