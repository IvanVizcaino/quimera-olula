import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ItemInventario } from "../../diseño.ts";
import { getInventario, getInventarios } from "../../infraestructura.ts";
import { ContextoMaestroInventario, EstadoMaestroInventario } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroInventario, ContextoMaestroInventario>;

const conInventarios = (fn: ProcesarListaActivaEntidades<ItemInventario>) =>
    (ctx: ContextoMaestroInventario) => ({ ...ctx, inventarios: fn(ctx.inventarios) });

export const Inventarios = accionesListaActivaEntidades(conInventarios);

export const recargarInventarios: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getInventarios(criteria);
    return Inventarios.recargar(contexto, resultado);
};

export const ampliarInventarios: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getInventarios(criteria);
    return Inventarios.ampliar(contexto, resultado);
};

export const incluirInventarioCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const inventario = await getInventario(id);
    return {
        ...contexto,
        estado: "INICIAL",
        inventarios: {
            ...contexto.inventarios,
            lista: [inventario, ...contexto.inventarios.lista],
            total: contexto.inventarios.total + 1,
            activo: inventario.id,
        },
    };
};
