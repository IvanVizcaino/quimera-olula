import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Cuenta } from "../diseño.ts";
import { getCuenta, getCuentas } from "../infraestructura.ts";
import { ContextoMaestroCuenta, EstadoMaestroCuenta } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroCuenta, ContextoMaestroCuenta>;

const conCuentas = (fn: ProcesarListaActivaEntidades<Cuenta>) =>
    (ctx: ContextoMaestroCuenta) => ({ ...ctx, cuentas: fn(ctx.cuentas) });

export const Cuentas = accionesListaActivaEntidades(conCuentas);

export const recargarCuentas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getCuentas(criteria);
    return Cuentas.recargar(contexto, resultado);
};

export const ampliarCuentas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getCuentas(criteria);
    return Cuentas.ampliar(contexto, resultado);
};

export const incluirCuentaCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const cuenta = await getCuenta(id);
    return {
        ...contexto,
        estado: "INICIAL",
        cuentas: {
            ...contexto.cuentas,
            lista: [cuenta, ...contexto.cuentas.lista],
            total: contexto.cuentas.total + 1,
            activo: cuenta.id,
        },
    };
};
