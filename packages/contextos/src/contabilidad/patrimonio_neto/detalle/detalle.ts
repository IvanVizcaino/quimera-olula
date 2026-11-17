import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosPatrimonioNeto, PatrimonioNeto } from "../diseño.ts";
import { patrimonioNetoVacio } from "../dominio.ts";
import {
    getDatosPatrimonioNeto,
    getPatrimonioNeto,
    patchPatrimonioNeto,
} from "../infraestructura.ts";
import {
    ContextoDetallePatrimonioNeto,
    EstadoDetallePatrimonioNeto,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetallePatrimonioNeto,
    ContextoDetallePatrimonioNeto
>;

const pipeInforme = ejecutarListaProcesos<
    EstadoDetallePatrimonioNeto,
    ContextoDetallePatrimonioNeto
>;

export const metaPatrimonioNeto: MetaModelo<PatrimonioNeto> = {
    campos: {
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const contextoDetallePatrimonioNetoInicial: ContextoDetallePatrimonioNeto =
    {
        estado: "INICIAL",
        informe: patrimonioNetoVacio(),
        datos: null,
    };

/** Qué ha cambiado respecto a lo guardado. */
export const cambiosDeInforme = (
    previo: PatrimonioNeto,
    actual: PatrimonioNeto
): CambiosPatrimonioNeto => {
    const cambios: CambiosPatrimonioNeto = {};
    if (actual.descripcion !== previo.descripcion)
        cambios.descripcion = actual.descripcion;
    if (actual.ejercicioId !== previo.ejercicioId)
        cambios.ejercicioId = actual.ejercicioId;
    if (actual.ejercicioAnteriorId !== previo.ejercicioAnteriorId)
        cambios.ejercicioAnteriorId = actual.ejercicioAnteriorId;
    if (actual.ejercicioAnteriorAnteriorId !== previo.ejercicioAnteriorAnteriorId)
        cambios.ejercicioAnteriorAnteriorId = actual.ejercicioAnteriorAnteriorId;
    return cambios;
};

export const guardarInforme = async (
    contexto: ContextoDetallePatrimonioNeto,
    informe: PatrimonioNeto
): Promise<void> => {
    const cambios = cambiosDeInforme(contexto.informe, informe);
    if (Object.keys(cambios).length === 0) return;
    await patchPatrimonioNeto(informe.id, cambios);
};

export const refrescarInforme: ProcesarDetalle = async (contexto) => {
    const informe = await getPatrimonioNeto(contexto.informe.id);
    return [
        // Los criterios han cambiado: la tabla que había deja de valer.
        { ...contexto, informe, datos: null },
        [["informe_cambiado", informe]],
    ];
};

export const calcularDatos: ProcesarDetalle = async (contexto) => {
    const datos = await getDatosPatrimonioNeto(contexto.informe.id);
    return { ...contexto, datos };
};

export const cargarInforme: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const informe = await getPatrimonioNeto(id);
        return pipeInforme(contexto, [
            async (ctx) => ({ ...ctx, informe, datos: null }),
            "ABIERTO",
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarInforme(id)(contexto);
    }
    return {
        ...contexto,
        estado: "INICIAL",
        informe: patrimonioNetoVacio(),
        datos: null,
    };
};
