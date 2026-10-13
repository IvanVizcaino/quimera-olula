import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoAgenteTpv, EstadoAgenteTpv } from "./diseño.ts";
import { cancelarEdicion, cargarContexto, refrescarAgente } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoAgenteTpv, ContextoAgenteTpv> = () => ({
    INICIAL: {
        agente_id_cambiado: [cargarContexto],
    },
    Editando: {
        agente_guardado: [refrescarAgente],
        cancelar_edicion: cancelarEdicion,
        borrar: "Borrando",
        cancelar_seleccion: publicar("seleccion_cancelada"),
    },
    Borrando: {
        borrado_cancelado: "Editando",
        agente_borrado: publicar("agente_borrado"),
    },
});
