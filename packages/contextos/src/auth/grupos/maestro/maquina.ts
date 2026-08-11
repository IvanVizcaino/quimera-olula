import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroGrupo, EstadoMaestroGrupo } from "./diseño.ts";
import { crearGrupo, Grupos, recargarGrupos } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroGrupo, ContextoMaestroGrupo> = () => ({
    LISTA: {
        grupo_seleccionado: Grupos.activar,
        grupo_deseleccionado: Grupos.desactivar,
        grupo_actualizado: Grupos.cambiar,
        recarga_de_grupos_solicitada: recargarGrupos,
        criteria_cambiado: [Grupos.filtrar, recargarGrupos],
        ALTA_INICIADA: "ALTA",
    },

    ALTA: {
        alta_de_grupo_confirmada: [crearGrupo, "LISTA"],
        ALTA_CANCELADA: "LISTA",
    },
});
