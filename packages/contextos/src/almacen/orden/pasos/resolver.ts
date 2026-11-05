import { buscarCajaCompletaPorTexto, buscarUbicacionPorTexto } from "#/almacen/comun/voz_resolvers.ts";
import { getSkuLote } from "../infraestructura.ts";
import { CodigoResuelto, TipoCodigo } from "./diseño.ts";

const limpiar = (texto: string) => texto.replace(/\s+/g, "").toLowerCase();
const sinPrefijoCaja = (texto: string) => limpiar(texto).replace(/^bx-/, "");

const resolverCaja = async (texto: string): Promise<CodigoResuelto | null> => {
    const caja = await buscarCajaCompletaPorTexto(texto);
    // Solo coincidencias exactas: un SKU o lote no debe confundirse con una caja.
    if (!caja || sinPrefijoCaja(caja.lpn) !== sinPrefijoCaja(texto)) return null;
    return {
        tipo: "caja",
        id: caja.id,
        lpn: caja.lpn,
        sku: caja.sku,
        idLote: caja.idLote,
        idUbicacion: caja.idUbicacion,
        cantidad: caja.cantidad,
        capacidad: caja.capacidad,
    };
};

const resolverUbicacion = async (texto: string): Promise<CodigoResuelto | null> => {
    const ubicacion = await buscarUbicacionPorTexto(texto);
    if (!ubicacion || limpiar(ubicacion.codigo) !== limpiar(texto)) return null;
    return { tipo: "ubicacion", id: ubicacion.id, codigo: ubicacion.codigo };
};

const resolverArticulo = async (texto: string): Promise<CodigoResuelto | null> => {
    try {
        const r = await getSkuLote(texto.trim());
        return { tipo: "articulo", sku: r.sku, descripcion: r.descripcion, loteId: r.loteId };
    } catch {
        return null;
    }
};

const resolvedores: Record<TipoCodigo, (texto: string) => Promise<CodigoResuelto | null>> = {
    caja: resolverCaja,
    ubicacion: resolverUbicacion,
    articulo: resolverArticulo,
};

const ORDEN_RESOLUCION: TipoCodigo[] = ["caja", "ubicacion", "articulo"];

/**
 * Interpreta un código leído probando solo los tipos aceptados por la
 * dimensión pendiente (caja → ubicación → artículo/lote).
 */
export const resolverCodigo = async (
    texto: string,
    aceptados: TipoCodigo[],
): Promise<CodigoResuelto | null> => {
    if (!texto.trim()) return null;
    for (const tipo of ORDEN_RESOLUCION.filter((t) => aceptados.includes(t))) {
        const resultado = await resolvedores[tipo](texto);
        if (resultado) return resultado;
    }
    return null;
};
