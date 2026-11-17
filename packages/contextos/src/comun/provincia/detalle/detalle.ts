import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { Provincia } from "../diseño.ts";
import { cambiosProvincia, provinciaVacio } from "../dominio.ts";
import { getProvincia, patchProvincia } from "../infraestructura.ts";
import { ContextoDetalleProvincia, EstadoDetalleProvincia } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleProvincia, ContextoDetalleProvincia>;

const pipeProvincia = ejecutarListaProcesos<EstadoDetalleProvincia, ContextoDetalleProvincia>;

export const contextoDetalleProvinciaInicial: ContextoDetalleProvincia = {
    estado: "INICIAL",
    provincia: provinciaVacio(),
};

export const guardarProvincia = async (contexto: ContextoDetalleProvincia, provincia: Provincia): Promise<void> => {
    const cambios = cambiosProvincia(contexto.provincia, provincia);
    if (Object.keys(cambios).length > 0) {
        await patchProvincia(provincia.id, cambios);
    }
};

export const refrescarProvincia: ProcesarDetalle = async (contexto) => {
    const provincia = await getProvincia(contexto.provincia.id);
    return [{ ...contexto, provincia }, [["provincia_cambiado", provincia]]];
};

export const cargarProvincia: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const provincia = await getProvincia(id);
    return pipeProvincia(contexto, [async (ctx) => ({ ...ctx, provincia }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarProvincia(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", provincia: provinciaVacio() };
};
