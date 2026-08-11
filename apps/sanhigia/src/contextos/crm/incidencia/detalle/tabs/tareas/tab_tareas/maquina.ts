import { Maquina } from "@olula/lib/diseño.js";
import { ContextoTareas, EstadoTareas } from "./diseño.ts";
import { cargarTareas } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoTareas, ContextoTareas> = () => {
    return {
        lista: {
            cargar_tareas: cargarTareas,
        },
    }
}
