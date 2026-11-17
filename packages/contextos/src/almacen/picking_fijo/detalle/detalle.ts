import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { pickingFijoVacio } from "../dominio.ts";
import { getPickingFijo } from "../infraestructura.ts";
import { ContextoDetallePickingFijo, EstadoDetallePickingFijo } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetallePickingFijo, ContextoDetallePickingFijo>;

export const contextoDetallePickingFijoInicial: ContextoDetallePickingFijo = {
    estado: "INICIAL",
    pickingFijo: pickingFijoVacio(),
};

export const refrescarPickingFijo: ProcesarDetalle = async (contexto) => {
    const pickingFijo = await getPickingFijo(contexto.pickingFijo.id);
    return [
        { ...contexto, pickingFijo },
        [["picking_fijo_cambiado", pickingFijo]],
    ];
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", pickingFijo: pickingFijoVacio() };
    }
    const pickingFijo = await getPickingFijo(id);
    return { ...contexto, estado: "ABIERTO", pickingFijo };
};
