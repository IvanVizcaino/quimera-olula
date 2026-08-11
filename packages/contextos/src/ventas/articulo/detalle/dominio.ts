import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { articuloVacio } from "../dominio.ts";
import { getArticulo } from "../infraestructura.ts";
import { ContextoDetalleArticulo, EstadoDetalleArticulo } from "./diseño.ts";

export type ProcesarDetalleArticulo = ProcesarContexto<
    EstadoDetalleArticulo,
    ContextoDetalleArticulo
>;

export const getContextoVacio: ProcesarDetalleArticulo = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    articulo: articuloVacio(),
});

export const cargarArticulo: ProcesarDetalleArticulo = async (contexto, payload) => {
    const id = payload as string;
    if (!id) return getContextoVacio(contexto);
    const articulo = await getArticulo(id);
    return { ...contexto, estado: "ABIERTO", articulo };
};
