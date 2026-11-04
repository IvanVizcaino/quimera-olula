import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Inventario } from "../../diseño.ts";
import { getInventario, getInventarios } from "../../infraestructura.ts";
import { ContextoMaestroInventario, EstadoMaestroInventario } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroInventario, ContextoMaestroInventario>;

const conInventarios = (fn: ProcesarListaActivaEntidades<Inventario>) =>
    (ctx: ContextoMaestroInventario) => ({ ...ctx, inventarios: fn(ctx.inventarios) });

export const Inventarios = accionesListaActivaEntidades(conInventarios);

export const recargarInventarios: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getInventarios(payload as Criteria);
    return Inventarios.recargar(contexto, resultado);
};

export const ampliarInventarios: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getInventarios(payload as Criteria);
    return Inventarios.ampliar(contexto, resultado);
};

export const incluirInventarioCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const inventario = await getInventario(payload as string);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroInventario,
        inventarios: {
            ...contexto.inventarios,
            lista: [inventario, ...contexto.inventarios.lista],
            total: contexto.inventarios.total + 1,
            activo: inventario.id,
        },
    };
};
