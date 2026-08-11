import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CuentaBancaria } from "../diseño.js";
import { getCuentaBancaria, getCuentasBancarias } from "../infraestructura.js";
import { ContextoMaestroCuentaBancaria, EstadoMaestroCuentaBancaria } from "./maquina.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroCuentaBancaria, ContextoMaestroCuentaBancaria>;

const conCuentas = (fn: ProcesarListaActivaEntidades<CuentaBancaria>) =>
    (ctx: ContextoMaestroCuentaBancaria) => ({ ...ctx, cuentas: fn(ctx.cuentas) });

export const Cuentas = accionesListaActivaEntidades(conCuentas);

export const recargarCuentas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getCuentasBancarias(criteria);
    return Cuentas.recargar(contexto, resultado);
};

export const ampliarCuentas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getCuentasBancarias(criteria);
    return Cuentas.ampliar(contexto, resultado);
};

export const incluirCuentaCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const cuenta = await getCuentaBancaria(id);
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
