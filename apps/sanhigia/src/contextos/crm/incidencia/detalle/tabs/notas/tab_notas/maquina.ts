import { Maquina } from "@olula/lib/diseño.js";
import { ContextoNotas, EstadoNotas } from "./diseño.ts";
import { cargarNotas, seleccionarNota } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoNotas, ContextoNotas> = () => {
    return {
        lista: {
            cargar_notas: cargarNotas,
            crear_nota_solicitado: "creando",
            borrar_nota_solicitado: [seleccionarNota, "borrando"],
        },
        creando: {
            nota_creada: [cargarNotas, "lista"],
            creacion_nota_cancelada: "lista",
        },
        borrando: {
            nota_borrada: [cargarNotas, "lista"],
            borrado_nota_cancelado: "lista",
        },
    }
}
