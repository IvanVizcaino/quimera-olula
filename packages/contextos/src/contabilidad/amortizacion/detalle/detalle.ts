import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { Amortizacion, CambiosAmortizacion } from "../diseño.ts";
import { amortizacionVacia } from "../dominio.ts";
import { getAmortizacion, patchAmortizacion } from "../infraestructura.ts";
import { ContextoDetalleAmortizacion, EstadoDetalleAmortizacion } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleAmortizacion, ContextoDetalleAmortizacion>;

const pipeAmortizacion = ejecutarListaProcesos<EstadoDetalleAmortizacion, ContextoDetalleAmortizacion>;

const CAMPOS_EDITABLES = [
    "elemento", "grupoId", "fecha", "fechaInicio", "valorAdquisicion", "valorResidual",
    "periodo", "porcentajeAnual", "porcentajePeriodo", "amortizacionPeriodo", "numPeriodos",
    "bloqueado", "noGenerarAsientoCierre", "vendido", "notas",
] as const;

const igual = (a: unknown, b: unknown): boolean =>
    a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b;

export const contextoDetalleAmortizacionInicial: ContextoDetalleAmortizacion = {
    estado: "INICIAL",
    amortizacion: amortizacionVacia(),
};

/** Solo lo cambiado: el servidor recalcula el resto como el formulario de
 * Eneboo, así que cada cambio se manda solo. */
export const cambiosAmortizacion = (
    previa: Amortizacion,
    actual: Amortizacion
): CambiosAmortizacion => {
    const cambios: Record<string, unknown> = {};
    for (const campo of CAMPOS_EDITABLES) {
        if (!igual(actual[campo], previa[campo])) cambios[campo] = actual[campo];
    }
    return cambios as CambiosAmortizacion;
};

export const guardarAmortizacion = async (
    contexto: ContextoDetalleAmortizacion,
    amortizacion: Amortizacion
): Promise<void> => {
    const cambios = cambiosAmortizacion(contexto.amortizacion, amortizacion);
    if (Object.keys(cambios).length > 0) {
        await patchAmortizacion(amortizacion.id, cambios);
    }
};

export const refrescarAmortizacion: ProcesarDetalle = async (contexto) => {
    const amortizacion = await getAmortizacion(contexto.amortizacion.id);
    return [{ ...contexto, amortizacion }, [["amortizacion_cambiada", amortizacion]]];
};

export const cargarAmortizacion: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const amortizacion = await getAmortizacion(id);
    return pipeAmortizacion(contexto, [async (ctx) => ({ ...ctx, amortizacion }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) return cargarAmortizacion(id)(contexto);
    return { ...contexto, estado: "INICIAL", amortizacion: amortizacionVacia() };
};
