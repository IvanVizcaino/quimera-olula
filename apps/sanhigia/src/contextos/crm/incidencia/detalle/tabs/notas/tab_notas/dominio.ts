import { ProcesarContexto } from "@olula/lib/diseño.js";
import { getNotas, postNota } from "../../../../infraestructura.ts";
import { Nota } from "../diseño.ts";
import { ContextoNotas, EstadoNotas } from "./diseño.ts";

type ProcesarNotas = ProcesarContexto<EstadoNotas, ContextoNotas>;

export const cargarNotas: ProcesarNotas = async (contexto, payload) => {
    const incidenciaId = (payload as string) || contexto.incidenciaId;
    const resultado = await getNotas(incidenciaId, { limite: 50, pagina: 1 });
    return {
        ...contexto,
        notas: resultado.datos,
        incidenciaId,
        cargando: false,
    }
}

export const seleccionarNota: ProcesarNotas = async (contexto, payload) => ({
    ...contexto,
    notaSeleccionada: payload as Nota,
});

export const crearNota: ProcesarNotas = async (contexto, payload) => {
    const { texto } = payload as { texto: string };

    const ahora = new Date().toISOString().split('T')[0];

    await postNota({
        texto,
        fecha: ahora,
        agenteId: contexto.agenteId,
        incidenciaId: contexto.incidenciaId,
    });

    // Recargar notas
    const resultado = await getNotas(contexto.incidenciaId, { limite: 50, pagina: 1 });

    return {
        ...contexto,
        notas: resultado.datos,
    };
}
