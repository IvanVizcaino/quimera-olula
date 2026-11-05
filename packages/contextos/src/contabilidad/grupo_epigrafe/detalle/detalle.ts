import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { GrupoEpigrafe } from "../diseño.ts";
import { grupoEpigrafeVacio } from "../dominio.ts";
import {
    getGrupoEpigrafe,
    patchGrupoEpigrafe,
} from "../infraestructura.ts";
import {
    ContextoDetalleGrupoEpigrafe,
    EstadoDetalleGrupoEpigrafe,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleGrupoEpigrafe,
    ContextoDetalleGrupoEpigrafe
>;

const pipeGrupo = ejecutarListaProcesos<
    EstadoDetalleGrupoEpigrafe,
    ContextoDetalleGrupoEpigrafe
>;

/** El ejercicio lo fija el alta: cambiarlo movería el grupo de plan contable,
 * así que va en solo lectura. */
export const metaGrupoEpigrafe: MetaModelo<GrupoEpigrafe> = {
    campos: {
        codigo: { requerido: true, maximo: 6 },
        descripcion: { requerido: true },
    },
};

export const contextoDetalleGrupoEpigrafeInicial: ContextoDetalleGrupoEpigrafe = {
    estado: 'INICIAL',
    grupo: grupoEpigrafeVacio(),
};

export const refrescarGrupoEpigrafe: ProcesarDetalle = async (contexto) => {
    const grupo = await getGrupoEpigrafe(contexto.grupo.id);
    return [
        { ...contexto, grupo },
        [["grupo_epigrafe_cambiado", grupo]],
    ];
};

export const guardarGrupoEpigrafe = async (
    contexto: ContextoDetalleGrupoEpigrafe,
    grupo: GrupoEpigrafe
): Promise<void> => {
    const previo = contexto.grupo;
    if (
        grupo.codigo !== previo.codigo ||
        grupo.descripcion !== previo.descripcion
    ) {
        await patchGrupoEpigrafe(grupo.id, {
            codigo: grupo.codigo,
            descripcion: grupo.descripcion,
        });
    }
};

export const cargarGrupoEpigrafe: (_: string) => ProcesarDetalle =
    (idGrupo) => async (contexto) => {
        const grupo = await getGrupoEpigrafe(idGrupo);
        return pipeGrupo(contexto, [
            async (ctx) => ({ ...ctx, grupo }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idGrupo = payload as string;
    if (idGrupo) {
        return cargarGrupoEpigrafe(idGrupo)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', grupo: grupoEpigrafeVacio() };
};
