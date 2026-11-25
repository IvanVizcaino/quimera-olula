import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { RegularizacionStock } from "../diseño.ts";
import { stockVacio } from "../dominio.ts";
import { getRegularizacionesStock, getStock } from "../infraestructura.ts";
import { ContextoDetalleStock, EstadoDetalleStock } from "./diseño.ts";

type ProcesarDetalleStock = ProcesarContexto<EstadoDetalleStock, ContextoDetalleStock>;

const pipeStock = ejecutarListaProcesos<EstadoDetalleStock, ContextoDetalleStock>;

const cargarStock = (idStock: string) => async (
    contexto: ContextoDetalleStock
): Promise<ContextoDetalleStock> => {
    const [stock, regularizaciones] = await Promise.all([
        getStock(idStock),
        getRegularizacionesStock(idStock),
    ]);
    return { ...contexto, stock, regularizaciones, regularizacionActiva: null };
};

export const contextoDetalleStockInicial: ContextoDetalleStock = {
    estado: "INICIAL",
    stock: { ...stockVacio },
    regularizaciones: [],
    regularizacionActiva: null,
};

export const getContextoVacio: ProcesarDetalleStock = async () => ({
    ...contextoDetalleStockInicial,
});

export const cargarContexto: ProcesarDetalleStock = async (contexto, payload) => {
    const idStock = payload as string;
    if (!idStock) {
        return getContextoVacio(contexto);
    }
    return pipeStock(contexto, [cargarStock(idStock), "ABIERTO"]);
};

/**
 * Tras regularizar o borrar una regularización: recarga stock y
 * regularizaciones, y avisa al maestro del nuevo stock.
 */
export const refrescarStock: ProcesarDetalleStock = async (contexto) => {
    const nuevo = await cargarStock(contexto.stock.id)(contexto);
    return [
        { ...nuevo, estado: "ABIERTO" },
        [["stock_cambiado", nuevo.stock]],
    ];
};

export const activarRegularizacion: ProcesarDetalleStock = async (contexto, payload) => ({
    ...contexto,
    regularizacionActiva: payload as RegularizacionStock,
});
