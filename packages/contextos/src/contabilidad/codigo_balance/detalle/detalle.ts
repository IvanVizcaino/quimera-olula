import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { CambiosCodigoBalance, CodigoBalance } from "../diseño.ts";
import { codigoBalanceVacio } from "../dominio.ts";
import { getCodigoBalance, patchCodigoBalance } from "../infraestructura.ts";
import { ContextoDetalleCodigoBalance, EstadoDetalleCodigoBalance } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleCodigoBalance, ContextoDetalleCodigoBalance>;

const pipeCodigoBalance = ejecutarListaProcesos<EstadoDetalleCodigoBalance, ContextoDetalleCodigoBalance>;

const CAMPOS_EDITABLES = [
    "naturaleza", "nivel1", "descripcion1", "nivel2", "descripcion2",
    "nivel3", "descripcion3", "nivel4", "descripcion4", "descripcion4ba",
] as const;

export const contextoDetalleCodigoBalanceInicial: ContextoDetalleCodigoBalance = {
    estado: "INICIAL",
    codigoBalance: codigoBalanceVacio(),
};

/** Solo los campos que han cambiado (el código es la clave y no se edita). */
export const cambiosCodigoBalance = (
    previo: CodigoBalance,
    actual: CodigoBalance
): CambiosCodigoBalance => {
    const cambios: CambiosCodigoBalance = {};
    for (const campo of CAMPOS_EDITABLES) {
        if (actual[campo] !== previo[campo]) cambios[campo] = actual[campo];
    }
    return cambios;
};

export const guardarCodigoBalance = async (
    contexto: ContextoDetalleCodigoBalance,
    codigoBalance: CodigoBalance
): Promise<void> => {
    const cambios = cambiosCodigoBalance(contexto.codigoBalance, codigoBalance);
    if (Object.keys(cambios).length > 0) {
        await patchCodigoBalance(codigoBalance.id, cambios);
    }
};

export const refrescarCodigoBalance: ProcesarDetalle = async (contexto) => {
    const codigoBalance = await getCodigoBalance(contexto.codigoBalance.id);
    return [
        { ...contexto, codigoBalance },
        [["codigo_balance_cambiado", codigoBalance]],
    ];
};

export const cargarCodigoBalance: (_: string) => ProcesarDetalle =
    (id) => async (contexto) => {
        const codigoBalance = await getCodigoBalance(id);
        return pipeCodigoBalance(contexto, [
            async (ctx) => ({ ...ctx, codigoBalance }),
            "ABIERTO",
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarCodigoBalance(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", codigoBalance: codigoBalanceVacio() };
};
