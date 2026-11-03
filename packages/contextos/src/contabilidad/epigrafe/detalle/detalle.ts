import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Epigrafe } from "../diseño.ts";
import { epigrafeVacio } from "../dominio.ts";
import { getEpigrafe, patchEpigrafe } from "../infraestructura.ts";
import {
    ContextoDetalleEpigrafe,
    EstadoDetalleEpigrafe,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleEpigrafe,
    ContextoDetalleEpigrafe
>;

const pipeEpigrafe = ejecutarListaProcesos<
    EstadoDetalleEpigrafe,
    ContextoDetalleEpigrafe
>;

/** El ejercicio lo fija el alta: cambiarlo movería el subgrupo de plan
 * contable, así que va en solo lectura. */
export const metaEpigrafe: MetaModelo<Epigrafe> = {
    campos: {
        codigo: { requerido: true, maximo: 6 },
        descripcion: { requerido: true },
        grupoId: { requerido: false },
    },
};

export const contextoDetalleEpigrafeInicial: ContextoDetalleEpigrafe = {
    estado: 'INICIAL',
    epigrafe: epigrafeVacio(),
};

export const refrescarEpigrafe: ProcesarDetalle = async (contexto) => {
    const epigrafe = await getEpigrafe(contexto.epigrafe.id);
    return [
        { ...contexto, epigrafe },
        [["epigrafe_cambiado", epigrafe]],
    ];
};

export const guardarEpigrafe = async (
    contexto: ContextoDetalleEpigrafe,
    epigrafe: Epigrafe
): Promise<void> => {
    const previo = contexto.epigrafe;
    if (
        epigrafe.codigo !== previo.codigo ||
        epigrafe.descripcion !== previo.descripcion ||
        epigrafe.grupoId !== previo.grupoId
    ) {
        await patchEpigrafe(epigrafe.id, {
            codigo: epigrafe.codigo,
            descripcion: epigrafe.descripcion,
            grupoId: epigrafe.grupoId,
        });
    }
};

export const cargarEpigrafe: (_: string) => ProcesarDetalle =
    (idEpigrafe) => async (contexto) => {
        const epigrafe = await getEpigrafe(idEpigrafe);
        return pipeEpigrafe(contexto, [
            async (ctx) => ({ ...ctx, epigrafe }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idEpigrafe = payload as string;
    if (idEpigrafe) {
        return cargarEpigrafe(idEpigrafe)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', epigrafe: epigrafeVacio() };
};
