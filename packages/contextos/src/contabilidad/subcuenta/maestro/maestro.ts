import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Subcuenta } from "../diseño.ts";
import { getSubcuenta, getSubcuentas } from "../infraestructura.ts";
import { ContextoMaestroSubcuenta, EstadoMaestroSubcuenta } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroSubcuenta, ContextoMaestroSubcuenta>;

const conSubcuentas = (fn: ProcesarListaActivaEntidades<Subcuenta>) =>
    (ctx: ContextoMaestroSubcuenta) => ({ ...ctx, subcuentas: fn(ctx.subcuentas) });

export const Subcuentas = accionesListaActivaEntidades(conSubcuentas);

export const recargarSubcuentas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getSubcuentas(criteria);
    return Subcuentas.recargar(contexto, resultado);
};

export const ampliarSubcuentas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getSubcuentas(criteria);
    return Subcuentas.ampliar(contexto, resultado);
};

export const incluirSubcuentaCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const subcuenta = await getSubcuenta(id);
    return {
        ...contexto,
        estado: "INICIAL",
        subcuentas: {
            ...contexto.subcuentas,
            lista: [subcuenta, ...contexto.subcuentas.lista],
            total: contexto.subcuentas.total + 1,
            activo: subcuenta.id,
        },
    };
};
