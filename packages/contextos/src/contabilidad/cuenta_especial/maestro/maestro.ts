import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CuentaEspecial } from "../diseño.ts";
import {
    getCuentaEspecial,
    getCuentasEspeciales,
} from "../infraestructura.ts";
import {
    ContextoMaestroCuentaEspecial,
    EstadoMaestroCuentaEspecial,
} from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<
    EstadoMaestroCuentaEspecial,
    ContextoMaestroCuentaEspecial
>;

const conCuentasEspeciales = (
    fn: ProcesarListaActivaEntidades<CuentaEspecial>
) => (ctx: ContextoMaestroCuentaEspecial) => ({
    ...ctx,
    cuentasEspeciales: fn(ctx.cuentasEspeciales),
});

export const CuentasEspeciales = accionesListaActivaEntidades(
    conCuentasEspeciales
);

export const recargarCuentasEspeciales: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const criteria = payload as Criteria;
    const resultado = await getCuentasEspeciales(criteria);
    return CuentasEspeciales.recargar(contexto, resultado);
};

export const ampliarCuentasEspeciales: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const criteria = payload as Criteria;
    const resultado = await getCuentasEspeciales(criteria);
    return CuentasEspeciales.ampliar(contexto, resultado);
};

export const incluirCuentaEspecialCreadaPorId: ProcesarMaestro = async (
    contexto,
    payload
) => {
    const id = payload as string;
    const cuentaEspecial = await getCuentaEspecial(id);
    return {
        ...contexto,
        estado: "INICIAL",
        cuentasEspeciales: {
            ...contexto.cuentasEspeciales,
            lista: [cuentaEspecial, ...contexto.cuentasEspeciales.lista],
            total: contexto.cuentasEspeciales.total + 1,
            activo: cuentaEspecial.id,
        },
    };
};
