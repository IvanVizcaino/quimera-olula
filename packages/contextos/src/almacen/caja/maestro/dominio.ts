import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { Caja } from "../diseño.ts";
import { getCaja, getCajas } from "../infraestructura.ts";
import { ContextoMaestroCaja, EstadoMaestroCaja } from "./diseño.ts";

export type ProcesarMaestroCaja = ProcesarContexto<EstadoMaestroCaja, ContextoMaestroCaja>;

const conCajas =
    (fn: ProcesarListaActivaEntidades<Caja>) =>
        (ctx: ContextoMaestroCaja) => ({ ...ctx, cajas: fn(ctx.cajas) });

export const Cajas = accionesListaActivaEntidades(conCajas);

export const recargarCajas: ProcesarMaestroCaja = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getCajas(criteria);
    return Cajas.recargar(contexto, resultado);
};

export const ampliarCajas: ProcesarMaestroCaja = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getCajas(criteria);
    return Cajas.ampliar(contexto, resultado);
};

export const incluirCajaCreadaPorId: ProcesarMaestroCaja = async (contexto, payload) => {
    const id = payload as string;
    const caja = await getCaja(id);
    return {
        ...contexto,
        estado: "INICIAL",
        cajas: {
            ...contexto.cajas,
            lista: [caja, ...contexto.cajas.lista],
            total: contexto.cajas.total + 1,
            activo: caja.id,
        },
    };
};
