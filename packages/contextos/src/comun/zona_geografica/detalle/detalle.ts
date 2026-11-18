import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { ZonaGeografica } from "../diseño.ts";
import { cambiosZonaGeografica, zonaGeograficaVacio } from "../dominio.ts";
import { getZonaGeografica, patchZonaGeografica } from "../infraestructura.ts";
import { ContextoDetalleZonaGeografica, EstadoDetalleZonaGeografica } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleZonaGeografica, ContextoDetalleZonaGeografica>;

const pipeZonaGeografica = ejecutarListaProcesos<EstadoDetalleZonaGeografica, ContextoDetalleZonaGeografica>;

export const contextoDetalleZonaGeograficaInicial: ContextoDetalleZonaGeografica = {
    estado: "INICIAL",
    zonaGeografica: zonaGeograficaVacio(),
};

export const guardarZonaGeografica = async (contexto: ContextoDetalleZonaGeografica, zonaGeografica: ZonaGeografica): Promise<void> => {
    const cambios = cambiosZonaGeografica(contexto.zonaGeografica, zonaGeografica);
    if (Object.keys(cambios).length > 0) {
        await patchZonaGeografica(zonaGeografica.id, cambios);
    }
};

export const refrescarZonaGeografica: ProcesarDetalle = async (contexto) => {
    const zonaGeografica = await getZonaGeografica(contexto.zonaGeografica.id);
    return [{ ...contexto, zonaGeografica }, [["zona_geografica_cambiado", zonaGeografica]]];
};

export const cargarZonaGeografica: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const zonaGeografica = await getZonaGeografica(id);
    return pipeZonaGeografica(contexto, [async (ctx) => ({ ...ctx, zonaGeografica }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarZonaGeografica(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", zonaGeografica: zonaGeograficaVacio() };
};
