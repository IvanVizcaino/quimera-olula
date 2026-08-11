import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Empresa } from "../diseño.js";
import { getEmpresa, getEmpresas } from "../infraestructura.js";
import { ContextoMaestroEmpresa, EstadoMaestroEmpresa } from "./maquina.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroEmpresa, ContextoMaestroEmpresa>;

const conEmpresas = (fn: ProcesarListaActivaEntidades<Empresa>) =>
    (ctx: ContextoMaestroEmpresa) => ({ ...ctx, empresas: fn(ctx.empresas) });

export const Empresas = accionesListaActivaEntidades(conEmpresas);

export const recargarEmpresas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getEmpresas(criteria);
    return Empresas.recargar(contexto, resultado);
};

export const ampliarEmpresas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getEmpresas(criteria);
    return Empresas.ampliar(contexto, resultado);
};

export const incluirEmpresaCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const empresa = await getEmpresa(id);
    return {
        ...contexto,
        estado: "INICIAL",
        empresas: {
            ...contexto.empresas,
            lista: [empresa, ...contexto.empresas.lista],
            total: contexto.empresas.total + 1,
            activo: empresa.id,
        },
    };
};
