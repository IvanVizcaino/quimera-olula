import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { getAsiento } from "../../infraestructura.ts";
import { asientoVacio } from "../../dominio.ts";
import { ContextoDetalleAsiento, EstadoDetalleAsiento } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleAsiento, ContextoDetalleAsiento>;

const pipeAsiento = ejecutarListaProcesos<EstadoDetalleAsiento, ContextoDetalleAsiento>;

export const refrescarAsiento: ProcesarDetalle = async (contexto) => {
    const asiento = await getAsiento(contexto.asiento.id);
    return [{ ...contexto, asiento }, [["asiento_cambiado", asiento]]];
};

const cargarAsiento = (id: string): ProcesarDetalle => async (contexto) =>
    pipeAsiento(contexto, [
        async (ctx) => ({ ...ctx, asiento: await getAsiento(id) }),
        "ABIERTO",
    ]);

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string | undefined;
    if (id) {
        return cargarAsiento(id)(contexto);
    }
    return { ...contexto, asiento: asientoVacio() };
};

export const onAsientoActualizado: ProcesarDetalle = async (contexto) =>
    pipeAsiento(contexto, [refrescarAsiento, "ABIERTO"]);
