import { getRecorridoOrden } from "#/almacen/orden/infraestructura.ts";
import { RecorridoOrden } from "#/almacen/orden/diseño.ts";
import { OrigenRotacion } from "#/almacen/slotting/diseño.ts";
import { DIAS_POR_DEFECTO, enteroPositivo, ORIGEN_POR_DEFECTO, origenRotacion } from "#/almacen/slotting/dominio.ts";
import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { CapaMapa, MapaAlmacen } from "./diseño.ts";
import { CAPA_POR_DEFECTO, capaMapa } from "./dominio.ts";
import { getMapa } from "./infraestructura.ts";

export type EstadoMapa = "INICIAL" | "CARGADO";

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
};

type ProcesarMapa = ProcesarContexto<EstadoMapa, ContextoMapa>;

const cargar: ProcesarMapa = async (ctx) => {
    if (!ctx.almacenId) return { ...ctx, estado: "INICIAL", mapa: null };
    const mapa = await getMapa(ctx.almacenId, enteroPositivo(ctx.dias, DIAS_POR_DEFECTO), ctx.origen);
    return { ...ctx, estado: "CARGADO", mapa };
};

const cambiarAlmacen: ProcesarMapa = async (ctx, payload) => cargar({
    ...ctx,
    almacenId: (payload as string) ?? "",
    zonaId: "",
    pasilloId: null,
    ubicacionId: null,
    recorrido: null,
});

const cambiarOrigen: ProcesarMapa = async (ctx, payload) => ({ ...ctx, origen: origenRotacion(payload as string) });

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

const verRecorrido: ProcesarMapa = async (ctx) => {
    const ordenId = ctx.ordenId.trim();
    if (!ordenId) return { ...ctx, recorrido: null };
    return { ...ctx, recorrido: await getRecorridoOrden(ordenId) };
};

const quitarRecorrido: ProcesarMapa = async (ctx) => ({ ...ctx, recorrido: null });

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
    },
});
