import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { getStock } from "../infraestructura.ts";
import { stockVacio } from "../dominio.ts";
import { ContextoDetalleStock, EstadoDetalleStock } from "./diseño.ts";

type ProcesarDetalleStock = ProcesarContexto<EstadoDetalleStock, ContextoDetalleStock>;

const pipeStock = ejecutarListaProcesos<EstadoDetalleStock, ContextoDetalleStock>;

const cargarStock = (idStock: string): ProcesarDetalleStock => async (contexto) => {
    const stock = await getStock(idStock);
    return { ...contexto, stock };
};

export const getContextoVacio: ProcesarDetalleStock = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    stock: { ...stockVacio },
});

export const cargarContexto: ProcesarDetalleStock = async (contexto, payload) => {
    const idStock = payload as string;
    if (!idStock) {
        return getContextoVacio(contexto);
    }
    return pipeStock(contexto, [cargarStock(idStock), "ABIERTO"]);
};
