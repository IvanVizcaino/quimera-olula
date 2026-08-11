import { ProcesarContexto } from "@olula/lib/diseño.js";
import { getTareas } from "../../../../infraestructura.ts";
import { ContextoTareas, EstadoTareas } from "./diseño.ts";

type ProcesarTareas = ProcesarContexto<EstadoTareas, ContextoTareas>;

export const cargarTareas: ProcesarTareas = async (contexto, payload) => {
    const incidenciaId = (payload as string) || contexto.incidenciaId;
    const resultado = await getTareas(incidenciaId, { limite: 50, pagina: 1 });
    return {
        ...contexto,
        tareas: resultado.datos,
        incidenciaId,
        cargando: false,
    }
}

