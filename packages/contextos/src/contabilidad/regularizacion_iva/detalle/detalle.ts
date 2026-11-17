import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { regularizacionIvaVacia } from "../dominio.ts";
import { getRegularizacionIva } from "../infraestructura.ts";
import {
    ContextoDetalleRegularizacionIva,
    EstadoDetalleRegularizacionIva,
} from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleRegularizacionIva,
    ContextoDetalleRegularizacionIva
>;

export const contextoDetalleRegularizacionIvaInicial: ContextoDetalleRegularizacionIva = {
    estado: "INICIAL",
    regularizacion: regularizacionIvaVacia(),
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", regularizacion: regularizacionIvaVacia() };
    }
    const regularizacion = await getRegularizacionIva(id);
    return { ...contexto, estado: "ABIERTO", regularizacion };
};
