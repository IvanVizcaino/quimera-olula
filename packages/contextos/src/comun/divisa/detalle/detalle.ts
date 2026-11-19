import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { Divisa } from "../diseño.ts";
import { cambiosDivisa, divisaVacio } from "../dominio.ts";
import { getDivisa, patchDivisa } from "../infraestructura.ts";
import { ContextoDetalleDivisa, EstadoDetalleDivisa } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleDivisa, ContextoDetalleDivisa>;

const pipeDivisa = ejecutarListaProcesos<EstadoDetalleDivisa, ContextoDetalleDivisa>;

export const contextoDetalleDivisaInicial: ContextoDetalleDivisa = {
    estado: "INICIAL",
    divisa: divisaVacio(),
};

export const guardarDivisa = async (contexto: ContextoDetalleDivisa, divisa: Divisa): Promise<void> => {
    const cambios = cambiosDivisa(contexto.divisa, divisa);
    if (Object.keys(cambios).length > 0) {
        await patchDivisa(divisa.id, cambios);
    }
};

export const refrescarDivisa: ProcesarDetalle = async (contexto) => {
    const divisa = await getDivisa(contexto.divisa.id);
    return [{ ...contexto, divisa }, [["divisa_cambiado", divisa]]];
};

export const cargarDivisa: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const divisa = await getDivisa(id);
    return pipeDivisa(contexto, [async (ctx) => ({ ...ctx, divisa }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarDivisa(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", divisa: divisaVacio() };
};
