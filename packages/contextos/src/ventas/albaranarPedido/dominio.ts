import { MetaTabla } from "@olula/componentes/index.js";
import { LineaPedido as Linea } from "../pedido/diseño.ts";
import { LineaAlbaranarPedido, LineasAlabaranPatch, Tramo } from "./diseño.ts";

export const metaTablaLineaPedido: MetaTabla<Linea> = [
    {
        id: "linea",
        cabecera: "Línea",
        render: (linea: Linea) => `${linea.referencia}: ${linea.descripcion}`,
    },
    {
        id: "cantidad",
        cabecera: "Cantidad",
        tipo: "numero"
    },
];

export const metaTablaTramoLineaPedido: MetaTabla<Tramo> = [
    {
        id: "lote_id",
        cabecera: "Lote ID"
    },
    {
        id: "ubicacion_id",
        cabecera: "Ubicación ID"
    },
    {
        id: "cantidad",
        cabecera: "Cantidad",
        tipo: "numero"
    },
    {
        id: "cantidad_ko",
        cabecera: "Cantidad KO",
        tipo: "numero"
    },
];

export const transformarLineasAlbaran = (lineas: LineaAlbaranarPedido[]): LineasAlabaranPatch[] => {
    const cantidadDesdeTramos = (tramos?: Tramo[]) =>
        (tramos || []).reduce((acc, tramo) => acc + (Number(tramo.cantidad) || 0), 0);

    return lineas
        .map<LineasAlabaranPatch>(linea => {
            const cantidad = linea.tramos && linea.tramos.length > 0
                ? cantidadDesdeTramos(linea.tramos)
                : (linea.a_enviar || 0);
            return {
                id: linea.id,
                cantidad,
                lotes: [] as []
            };
        })
        .filter(linea => linea.cantidad > 0);
}

export const calcularAEnviar = (linea: LineaAlbaranarPedido): number => {
    const tramos = linea.tramos ?? [];
    return tramos.length > 0
        ? tramos.reduce((total, tramo) => total + (Number(tramo.cantidad) || 0), 0)
        : (linea.a_enviar || 0);
};

export const calcularDisponible = (linea: LineaAlbaranarPedido): number =>
    linea.cantidad - (linea.servida || 0) - calcularAEnviar(linea);

export const lineaAprobadaCompleta = (linea: LineaAlbaranarPedido): boolean => {
    const aEnviar = calcularAEnviar(linea);
    return linea.cantidad > 0 && aEnviar + (linea.servida || 0) >= linea.cantidad;
};

export const obtenerClaseEstadoAlbaranado = (linea: LineaAlbaranarPedido) => {
    const aEnviar = linea.a_enviar || 0;
    const servida = linea.servida || 0;
    if (linea.cerrada) return "cerrada";
    if (aEnviar > 0 && aEnviar < linea.cantidad) return "modificada";
    if (aEnviar + servida === linea.cantidad) return "completa";
    if (aEnviar + servida > 0 && aEnviar + servida < linea.cantidad)
        return "modificada";
    return "";
};