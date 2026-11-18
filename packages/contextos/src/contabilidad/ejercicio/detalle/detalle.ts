import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejercicioVacio } from "../dominio.ts";
import { getEjercicio } from "../infraestructura.ts";
import { ContextoDetalleEjercicio, EstadoDetalleEjercicio } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleEjercicio, ContextoDetalleEjercicio>;

export const contextoDetalleEjercicioInicial: ContextoDetalleEjercicio = {
    estado: "INICIAL",
    ejercicio: ejercicioVacio(),
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", ejercicio: ejercicioVacio() };
    }
    const ejercicio = await getEjercicio(id);
    return { ...contexto, estado: "ABIERTO", ejercicio };
};

/** Recarga el ejercicio y avisa al maestro: el cierre cambia también otros. */
export const refrescarEjercicio: ProcesarDetalle = async (contexto) => {
    const ejercicio = await getEjercicio(contexto.ejercicio.id);
    return [
        { ...contexto, estado: "ABIERTO", ejercicio },
        [["ejercicio_cambiado", ejercicio]],
    ];
};
