import { getLineasPedido } from "#/compras/pedido/infraestructura.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { AlbaranarPedido, LineaAlbaranar, LoteAlbaranar } from "../../diseño.ts";
import {
    addLoteLinea,
    lineaDesdeLineaPedido,
    marcarTodasPendientes,
    removeLoteLinea,
    setCerradaLinea,
    setRecibiendoLinea,
    updateLoteLinea,
} from "../../dominio.ts";
import { patchAlbaranarPedido } from "../../infraestructura.ts";
import { ContextoAlbaranar, EstadoAlbaranar } from "./diseño.ts";

type ProcesarAlbaranar = ProcesarContexto<EstadoAlbaranar, ContextoAlbaranar>;

const albaranadoVacio: AlbaranarPedido = {
    id: "",
    lineas: [],
};

export const contextoVacio: ContextoAlbaranar = {
    estado: "INICIAL",
    albaranado: albaranadoVacio,
    lineaActivaId: null,
    loteActivo: null,
    albaranCreado: null,
};

export const cargarDatos: ProcesarAlbaranar = async (ctx, payload) => {
    const pedidoId = payload as string;
    const lineasPedido = await getLineasPedido(pedidoId);
    const lineas = lineasPedido.map(lineaDesdeLineaPedido);
    return {
        ...ctx,
        albaranado: { id: pedidoId, lineas },
        albaranCreado: null,
    };
};

export const marcarTodo: ProcesarAlbaranar = async (ctx) => ({
    ...ctx,
    albaranado: marcarTodasPendientes(ctx.albaranado),
});

export const cambiarRecibiendo: ProcesarAlbaranar = async (ctx, payload) => {
    const { idLinea, recibiendo } = payload as { idLinea: string; recibiendo: number };
    return {
        ...ctx,
        albaranado: setRecibiendoLinea(ctx.albaranado, idLinea, recibiendo),
    };
};

export const cambiarCerrada: ProcesarAlbaranar = async (ctx, payload) => {
    const { idLinea, cerrada } = payload as { idLinea: string; cerrada: boolean };
    return {
        ...ctx,
        albaranado: setCerradaLinea(ctx.albaranado, idLinea, cerrada),
    };
};

export const solicitarCrearLote: ProcesarAlbaranar = async (ctx, payload) => {
    const idLinea = payload as string;
    return { ...ctx, lineaActivaId: idLinea };
};

export const crearLote: ProcesarAlbaranar = async (ctx, payload) => {
    const { idLinea, lote } = payload as { idLinea: string; lote: LoteAlbaranar };
    return {
        ...ctx,
        albaranado: addLoteLinea(ctx.albaranado, idLinea, lote),
        lineaActivaId: null,
    };
};

export const solicitarCambiarLote: ProcesarAlbaranar = async (ctx, payload) => {
    const { idLinea, lote } = payload as { idLinea: string; lote: LoteAlbaranar };
    return { ...ctx, lineaActivaId: idLinea, loteActivo: lote };
};

export const cambiarLote: ProcesarAlbaranar = async (ctx, payload) => {
    const { idLinea, lote } = payload as { idLinea: string; lote: LoteAlbaranar };
    return {
        ...ctx,
        albaranado: updateLoteLinea(ctx.albaranado, idLinea, lote),
        lineaActivaId: null,
        loteActivo: null,
    };
};

export const solicitarBorrarLote: ProcesarAlbaranar = async (ctx, payload) => {
    const { idLinea, lote } = payload as { idLinea: string; lote: LoteAlbaranar };
    return { ...ctx, lineaActivaId: idLinea, loteActivo: lote };
};

export const borrarLote: ProcesarAlbaranar = async (ctx) => {
    const { lineaActivaId, loteActivo } = ctx;
    if (!lineaActivaId || !loteActivo) return ctx;
    return {
        ...ctx,
        albaranado: removeLoteLinea(ctx.albaranado, lineaActivaId, loteActivo.idLote),
        lineaActivaId: null,
        loteActivo: null,
    };
};

export const cancelarModal: ProcesarAlbaranar = async (ctx) => ({
    ...ctx,
    lineaActivaId: null,
    loteActivo: null,
});

export const albaranar: ProcesarAlbaranar = async (ctx) => {
    const albaranCreado = await patchAlbaranarPedido(ctx.albaranado);
    const lineasPedido = await getLineasPedido(ctx.albaranado.id);
    const lineas = lineasPedido.map((l) => lineaDesdeLineaPedido(l));
    return {
        ...ctx,
        albaranado: { ...ctx.albaranado, lineas },
        albaranCreado,
    };
};

// Tipos auxiliares exportados para uso en maquina.ts
export type { LineaAlbaranar, LoteAlbaranar };
