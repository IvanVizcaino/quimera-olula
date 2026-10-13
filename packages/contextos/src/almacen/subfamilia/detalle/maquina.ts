import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoSubfamilia, EstadoSubfamilia } from "./diseño.ts";
import { cancelarEdicion, cargarContexto, refrescarSubfamilia } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoSubfamilia, ContextoSubfamilia> = () => ({
    INICIAL: {
        subfamilia_id_cambiado: [cargarContexto],
    },
    Editando: {
        subfamilia_guardada: [refrescarSubfamilia],
        cancelar_edicion: cancelarEdicion,
        borrar: "Borrando",
        cancelar_seleccion: publicar("seleccion_cancelada"),
    },
    Borrando: {
        borrado_cancelado: "Editando",
        subfamilia_borrada: publicar("subfamilia_borrada"),
    },
});
