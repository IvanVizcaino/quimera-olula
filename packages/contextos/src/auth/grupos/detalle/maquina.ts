import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoDetalleGrupo, EstadoDetalleGrupo } from "./diseño.ts";
import {
    borrarCategoria,
    borrarRegla,
    cancelarCategoria,
    cancelarRegla,
    cargarReglasGrupo,
    permitirCategoria,
    permitirRegla,
    toggleCategoria,
    toggleRegla,
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoDetalleGrupo, ContextoDetalleGrupo> = () => ({
    INICIAL: {
        grupo_cambiado: [cargarReglasGrupo, "LISTA"],
    },

    LISTA: {
        grupo_cambiado: cargarReglasGrupo,
        PERMITIR_REGLA: permitirRegla,
        CANCELAR_REGLA: cancelarRegla,
        BORRAR_REGLA: borrarRegla,
        PERMITIR_REGLA_CATEGORIA: permitirCategoria,
        CANCELAR_REGLA_CATEGORIA: cancelarCategoria,
        BORRAR_REGLA_CATEGORIA: borrarCategoria,
        TOGGLE_CATEGORIA: toggleCategoria,
        TOGGLE_REGLA: toggleRegla,
    },
});
