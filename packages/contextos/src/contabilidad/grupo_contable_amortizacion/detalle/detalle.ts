import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { CambiosGrupoContableAmortizacion, GrupoContableAmortizacion } from "../diseño.ts";
import { grupoContableAmortizacionVacio } from "../dominio.ts";
import { getGrupoContableAmortizacion, patchGrupoContableAmortizacion } from "../infraestructura.ts";
import {
    ContextoDetalleGrupoContableAmortizacion,
    EstadoDetalleGrupoContableAmortizacion,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleGrupoContableAmortizacion,
    ContextoDetalleGrupoContableAmortizacion
>;

const pipeGrupo = ejecutarListaProcesos<
    EstadoDetalleGrupoContableAmortizacion,
    ContextoDetalleGrupoContableAmortizacion
>;

const CAMPOS_EDITABLES = [
    "descripcion", "subcuentaElemento", "subcuentaAmortizacion",
    "subcuentaGasto", "subcuentaPerdidas", "subcuentaGanancias",
] as const;

export const contextoDetalleGrupoInicial: ContextoDetalleGrupoContableAmortizacion = {
    estado: "INICIAL",
    grupo: grupoContableAmortizacionVacio(),
};

export const cambiosGrupo = (
    previo: GrupoContableAmortizacion,
    actual: GrupoContableAmortizacion
): CambiosGrupoContableAmortizacion => {
    const cambios: CambiosGrupoContableAmortizacion = {};
    for (const campo of CAMPOS_EDITABLES) {
        if (actual[campo] !== previo[campo]) cambios[campo] = actual[campo];
    }
    return cambios;
};

export const guardarGrupo = async (
    contexto: ContextoDetalleGrupoContableAmortizacion,
    grupo: GrupoContableAmortizacion
): Promise<void> => {
    const cambios = cambiosGrupo(contexto.grupo, grupo);
    if (Object.keys(cambios).length > 0) {
        await patchGrupoContableAmortizacion(grupo.id, cambios, ejercicioActual());
    }
};

export const refrescarGrupo: ProcesarDetalle = async (contexto) => {
    const grupo = await getGrupoContableAmortizacion(contexto.grupo.id);
    return [{ ...contexto, grupo }, [["grupo_cambiado", grupo]]];
};

export const cargarGrupo: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const grupo = await getGrupoContableAmortizacion(id);
    return pipeGrupo(contexto, [async (ctx) => ({ ...ctx, grupo }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarGrupo(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", grupo: grupoContableAmortizacionVacio() };
};
