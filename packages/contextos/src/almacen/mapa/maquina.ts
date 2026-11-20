import { getRecorridoOrden } from "#/almacen/orden/infraestructura.ts";
import { RecorridoOrden } from "#/almacen/orden/diseño.ts";
import { OrigenRotacion } from "#/almacen/slotting/diseño.ts";
import { DIAS_POR_DEFECTO, enteroPositivo, ORIGEN_POR_DEFECTO, origenRotacion } from "#/almacen/slotting/dominio.ts";
import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { CapaMapa, ElegidoPlanta, MapaAlmacen, PlantaAlmacen, TrazadoRecorrido, VistaMapa } from "./diseño.ts";
import { CAPA_POR_DEFECTO, capaMapa, desplazarPieza, plantaInicial } from "./dominio.ts";
import { getMapa, getTrazado, guardarPlanta } from "./infraestructura.ts";

/** EDITANDO: el editor de la planta real, con su borrador. */
export type EstadoMapa = "INICIAL" | "CARGADO" | "EDITANDO";

export type ContextoMapa = {
    estado: EstadoMapa;
    almacenId: string;
    origen: OrigenRotacion;
    dias: string;
    capa: CapaMapa;
    /** "" = todas las zonas. */
    zonaId: string;
    mapa: MapaAlmacen | null;
    /** Pasillo cuyo alzado se muestra. */
    pasilloId: string | null;
    ubicacionId: string | null;
    ordenId: string;
    recorrido: RecorridoOrden | null;
    /** Camino del recorrido por la planta real (null sin planta o sin recorrido). */
    trazado: TrazadoRecorrido | null;
    vista: VistaMapa;
    /** La planta que se está editando (solo en EDITANDO). */
    borrador: PlantaAlmacen | null;
    elegido: ElegidoPlanta | null;
};

export const contextoMapaInicial: ContextoMapa = {
    estado: "INICIAL",
    almacenId: "",
    origen: ORIGEN_POR_DEFECTO,
    dias: String(DIAS_POR_DEFECTO),
    capa: CAPA_POR_DEFECTO,
    zonaId: "",
    mapa: null,
    pasilloId: null,
    ubicacionId: null,
    ordenId: "",
    recorrido: null,
    trazado: null,
    vista: "ESQUEMA",
    borrador: null,
    elegido: null,
};

type ProcesarMapa = ProcesarContexto<EstadoMapa, ContextoMapa>;

const cargar: ProcesarMapa = async (ctx) => {
    if (!ctx.almacenId) return { ...ctx, estado: "INICIAL", mapa: null };
    const mapa = await getMapa(ctx.almacenId, enteroPositivo(ctx.dias, DIAS_POR_DEFECTO), ctx.origen);
    // Sin planta solo hay esquema.
    return { ...ctx, estado: "CARGADO", mapa, vista: mapa.planta ? ctx.vista : "ESQUEMA" };
};

const cambiarAlmacen: ProcesarMapa = async (ctx, payload) => cargar({
    ...ctx,
    almacenId: (payload as string) ?? "",
    zonaId: "",
    pasilloId: null,
    ubicacionId: null,
    recorrido: null,
    trazado: null,
});

/** La rotación cambia las capas ABC y slotting: con el mapa ya cargado, se recalcula. */
const cambiarOrigen: ProcesarMapa = async (ctx, payload) => {
    const nuevo = { ...ctx, origen: origenRotacion(payload as string) };
    return ctx.mapa && nuevo.origen !== ctx.origen ? cargar(nuevo) : nuevo;
};

const cambiarDias: ProcesarMapa = async (ctx, payload) => ({ ...ctx, dias: (payload as string) ?? "" });

const cambiarCapa: ProcesarMapa = async (ctx, payload) => ({ ...ctx, capa: capaMapa(payload as string) });

const cambiarZona: ProcesarMapa = async (ctx, payload) => ({ ...ctx, zonaId: (payload as string) ?? "" });

const seleccionarPasillo: ProcesarMapa = async (ctx, payload) => ({
    ...ctx,
    pasilloId: (payload as string | null) ?? null,
    ubicacionId: null,
});

const seleccionarUbicacion: ProcesarMapa = async (ctx, payload) => ({
    ...ctx,
    ubicacionId: (payload as string | null) ?? null,
});

const cambiarOrden: ProcesarMapa = async (ctx, payload) => ({ ...ctx, ordenId: (payload as string) ?? "" });

/** Con planta, el camino a pie entre las paradas (en su orden). */
const conTrazado: ProcesarMapa = async (ctx) => {
    if (!ctx.recorrido || !ctx.mapa?.planta || ctx.recorrido.paradas.length === 0) return { ...ctx, trazado: null };
    // Desde el punto de inicio (muelle de salida o de recepción) y de vuelta al de fin, si los hay.
    const { inicioUbicacionId, finUbicacionId } = ctx.recorrido;
    const ubicaciones = [
        ...(inicioUbicacionId ? [inicioUbicacionId] : []),
        ...[...ctx.recorrido.paradas].sort((a, b) => a.secuencia - b.secuencia).map((p) => p.ubicacionId),
        ...(finUbicacionId ? [finUbicacionId] : []),
    ];
    return { ...ctx, trazado: await getTrazado(ctx.almacenId, ubicaciones) };
};

const verRecorrido: ProcesarMapa = async (ctx) => {
    const ordenId = ctx.ordenId.trim();
    if (!ordenId) return { ...ctx, recorrido: null, trazado: null };
    return conTrazado({ ...ctx, recorrido: await getRecorridoOrden(ordenId) });
};

const quitarRecorrido: ProcesarMapa = async (ctx) => ({ ...ctx, recorrido: null, trazado: null });

const cambiarVista: ProcesarMapa = async (ctx, payload) => ({
    ...ctx,
    vista: payload === "PLANTA" && ctx.mapa?.planta ? "PLANTA" : "ESQUEMA",
});

/** Edita la planta del almacén o, si no tiene, una propuesta con todos sus pasillos. */
const editar: ProcesarMapa = async (ctx) => {
    if (!ctx.mapa) return ctx;
    return {
        ...ctx,
        estado: "EDITANDO",
        vista: "PLANTA",
        borrador: ctx.mapa.planta ?? plantaInicial(ctx.mapa),
        elegido: null,
        pasilloId: null,
        ubicacionId: null,
    };
};

/** `elegido`: lo que queda elegido tras el cambio (sin él, se mantiene). Un solo evento por acción. */
const cambiarBorrador: ProcesarMapa = async (ctx, payload) => {
    const { planta, elegido } = payload as { planta: PlantaAlmacen; elegido?: ElegidoPlanta | null };
    return { ...ctx, borrador: planta, elegido: elegido === undefined ? ctx.elegido : elegido };
};

/**
 * Mover una pieza no pasa por `emitir`, que parte del contexto del último render: dos flechas
 * seguidas se pisarían. Se aplica con `setCtx(c => desplazarEnBorrador(c, ...))` sobre el vigente.
 */
export const desplazarEnBorrador = (
    ctx: ContextoMapa, elegido: ElegidoPlanta, dx: number, dy: number,
): ContextoMapa =>
    ctx.estado === "EDITANDO" && ctx.mapa && ctx.borrador
        ? { ...ctx, borrador: desplazarPieza(ctx.mapa, ctx.borrador, elegido, dx, dy), elegido }
        : ctx;

const elegir: ProcesarMapa = async (ctx, payload) => ({ ...ctx, elegido: (payload as ElegidoPlanta | null) ?? null });

const cancelarEdicion: ProcesarMapa = async (ctx) => ({
    ...ctx,
    estado: "CARGADO",
    borrador: null,
    elegido: null,
    vista: ctx.mapa?.planta ? "PLANTA" : "ESQUEMA",
});

const guardar: ProcesarMapa = async (ctx) => {
    if (!ctx.borrador) return ctx;
    await guardarPlanta(ctx.almacenId, ctx.borrador);
    const mapa = await getMapa(ctx.almacenId, enteroPositivo(ctx.dias, DIAS_POR_DEFECTO), ctx.origen);
    // La planta cambia el camino: se vuelve a trazar el recorrido que hubiera.
    return conTrazado({ ...ctx, estado: "CARGADO", mapa, borrador: null, elegido: null, vista: "PLANTA" });
};

export const getMaquina: () => Maquina<EstadoMapa, ContextoMapa> = () => ({
    INICIAL: {
        almacen_cambiado: cambiarAlmacen,
        origen_cambiado: cambiarOrigen,
        dias_cambiados: cambiarDias,
        capa_cambiada: cambiarCapa,
    },
    CARGADO: {
        almacen_cambiado: cambiarAlmacen,
        origen_cambiado: cambiarOrigen,
        dias_cambiados: cambiarDias,
        capa_cambiada: cambiarCapa,
        actualizacion_solicitada: cargar,
        zona_cambiada: cambiarZona,
        pasillo_seleccionado: seleccionarPasillo,
        ubicacion_seleccionada: seleccionarUbicacion,
        orden_cambiada: cambiarOrden,
        recorrido_solicitado: verRecorrido,
        recorrido_quitado: quitarRecorrido,
        vista_cambiada: cambiarVista,
        edicion_solicitada: editar,
    },
    EDITANDO: {
        capa_cambiada: cambiarCapa,
        borrador_cambiado: cambiarBorrador,
        pieza_elegida: elegir,
        edicion_cancelada: cancelarEdicion,
        guardado_solicitado: guardar,
    },
});
