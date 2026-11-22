import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { Pais } from "../diseño.ts";
import { cambiosPais, paisVacio } from "../dominio.ts";
import { getPais, patchPais } from "../infraestructura.ts";
import { ContextoDetallePais, EstadoDetallePais } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetallePais, ContextoDetallePais>;

const pipePais = ejecutarListaProcesos<EstadoDetallePais, ContextoDetallePais>;

export const contextoDetallePaisInicial: ContextoDetallePais = {
    estado: "INICIAL",
    pais: paisVacio(),
};

export const guardarPais = async (contexto: ContextoDetallePais, pais: Pais): Promise<void> => {
    const cambios = cambiosPais(contexto.pais, pais);
    if (Object.keys(cambios).length > 0) {
        await patchPais(pais.id, cambios);
    }
};

export const refrescarPais: ProcesarDetalle = async (contexto) => {
    const pais = await getPais(contexto.pais.id);
    return [{ ...contexto, pais }, [["pais_cambiado", pais]]];
};

export const cargarPais: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const pais = await getPais(id);
    return pipePais(contexto, [async (ctx) => ({ ...ctx, pais }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarPais(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", pais: paisVacio() };
};
