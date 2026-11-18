import { conChecks } from "#/contabilidad/comun/checks_informe.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosCuentasAnuales, CuentasAnuales } from "../diseño.ts";
import {
    cuentasAnualesVacias,
    desgloseSegunFormato,
    omitirEpigrafesSegunTipo,
} from "../dominio.ts";
import {
    getBalanceCuentasAnuales,
    getCuentasAnuales,
    patchCuentasAnuales,
} from "../infraestructura.ts";
import {
    ContextoDetalleCuentasAnuales,
    EstadoDetalleCuentasAnuales,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleCuentasAnuales,
    ContextoDetalleCuentasAnuales
>;

const pipeInforme = ejecutarListaProcesos<
    EstadoDetalleCuentasAnuales,
    ContextoDetalleCuentasAnuales
>;

/** «Omitir epígrafes sin saldo» (`omitirepigsinsaldo`, bool) es casilla. */
export const metaCuentasAnuales: MetaModelo<CuentasAnuales> = conChecks<CuentasAnuales>(
    {
        campos: {
            descripcion: { requerido: true },
            tipo: { requerido: true },
            formato: { requerido: true },
            nivelDesglose: { requerido: true },
            ejercicioId: { requerido: true },
        },
    },
    ["omitirEpigrafesSinSaldo"],
    omitirEpigrafesSegunTipo
);

export const contextoDetalleCuentasAnualesInicial: ContextoDetalleCuentasAnuales =
    {
        estado: "INICIAL",
        informe: cuentasAnualesVacias(),
        balance: null,
    };

/** Qué ha cambiado respecto a lo guardado. Los campos de cada periodo van
 * juntos: la API recibe el periodo entero. */
export const cambiosDeInforme = (
    previo: CuentasAnuales,
    actual: CuentasAnuales
): CambiosCuentasAnuales => {
    const cambios: CambiosCuentasAnuales = {};

    if (actual.descripcion !== previo.descripcion)
        cambios.descripcion = actual.descripcion;
    if (actual.tipo !== previo.tipo) cambios.tipo = actual.tipo;
    if (actual.formato !== previo.formato) cambios.formato = actual.formato;
    if (actual.nivelDesglose !== previo.nivelDesglose)
        cambios.nivelDesglose = desgloseSegunFormato(
            actual.formato,
            actual.nivelDesglose
        );
    if (actual.omitirEpigrafesSinSaldo !== previo.omitirEpigrafesSinSaldo)
        cambios.omitirEpigrafesSinSaldo = actual.omitirEpigrafesSinSaldo;

    if (
        actual.ejercicioId !== previo.ejercicioId ||
        actual.fechaDesde !== previo.fechaDesde ||
        actual.fechaHasta !== previo.fechaHasta
    ) {
        cambios.ejercicioId = actual.ejercicioId;
        cambios.fechaDesde = actual.fechaDesde;
        cambios.fechaHasta = actual.fechaHasta;
    }

    if (
        actual.ejercicioAnteriorId !== previo.ejercicioAnteriorId ||
        actual.fechaDesdeAnterior !== previo.fechaDesdeAnterior ||
        actual.fechaHastaAnterior !== previo.fechaHastaAnterior
    ) {
        cambios.ejercicioAnteriorId = actual.ejercicioAnteriorId;
        cambios.fechaDesdeAnterior = actual.fechaDesdeAnterior;
        cambios.fechaHastaAnterior = actual.fechaHastaAnterior;
    }

    return cambios;
};

export const guardarInforme = async (
    contexto: ContextoDetalleCuentasAnuales,
    informe: CuentasAnuales
): Promise<void> => {
    const cambios = cambiosDeInforme(contexto.informe, informe);
    if (Object.keys(cambios).length === 0) return;
    await patchCuentasAnuales(informe.id, cambios);
};

export const refrescarInforme: ProcesarDetalle = async (contexto) => {
    const informe = await getCuentasAnuales(contexto.informe.id);
    return [
        // Los criterios han cambiado: el balance que había deja de valer.
        { ...contexto, informe, balance: null },
        [["informe_cambiado", informe]],
    ];
};

export const calcularBalance: ProcesarDetalle = async (contexto) => {
    const balance = await getBalanceCuentasAnuales(contexto.informe.id);
    return { ...contexto, balance };
};

export const cargarInforme: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const informe = await getCuentasAnuales(id);
        return pipeInforme(contexto, [
            async (ctx) => ({ ...ctx, informe, balance: null }),
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
        informe: cuentasAnualesVacias(),
        balance: null,
    };
};
