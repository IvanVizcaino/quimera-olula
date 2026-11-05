// Consultas al backend que necesita el lector antes de aplicar un código.
// Solo intervienen en el pick con origen UBI_O_CAJA (SKU_CAJA, LOTE_CAJA).
import { LineaOrdenAlmacen, OrdenAlmacen } from "../diseño.ts";
import { getLotesDeArticuloEnCaja, getStockDesgloseCaja } from "../infraestructura.ts";
import { definicionDeLinea } from "./catalogo.ts";
import { CajaResuelta, CodigoResuelto, ContextoLectura, DefinicionPasos, FaseLectura } from "./diseño.ts";
import { lineasPendientes } from "./lector.ts";

const usaContexto = (def: DefinicionPasos, linea: LineaOrdenAlmacen, fase: FaseLectura): boolean =>
    fase === "PICK" && def.origen === "UBI_O_CAJA" && !!linea.idUbicacionOrigen;

export const contextoPara = async (
    def: DefinicionPasos,
    linea: LineaOrdenAlmacen,
    codigo: CodigoResuelto,
    fase: FaseLectura,
): Promise<ContextoLectura> => {
    if (!usaContexto(def, linea, fase)) return {};
    const ubicacion = linea.idUbicacionOrigen!;

    if (codigo.tipo === "caja") {
        if (codigo.idLote || (codigo.sku && !linea.porLotes)) return {};
        return { lotesEnCaja: await getLotesDeArticuloEnCaja(ubicacion, linea.sku, codigo.id) };
    }

    if (codigo.tipo === "articulo") {
        const desglose = await getStockDesgloseCaja(ubicacion, codigo.sku, codigo.loteId ?? undefined);
        const suelto = desglose?.find((item) => item.cajaId === null && item.cantidad > 0);
        return { stockSuelto: suelto?.cantidad ?? 0 };
    }

    return {};
};

/**
 * Caja sin SKU (multiproducto) leída en el pick de cabecera: busca la línea
 * pendiente cuyo artículo está dentro de la caja.
 */
export const buscarLineaEnCajaMultiproducto = async (
    orden: OrdenAlmacen,
    fase: FaseLectura,
    caja: CajaResuelta,
): Promise<{ linea: LineaOrdenAlmacen; ctx: ContextoLectura } | null> => {
    for (const linea of lineasPendientes(orden, fase)) {
        const def = definicionDeLinea(linea, orden, fase)!;
        if (!usaContexto(def, linea, fase) || !linea.porLotes) continue;
        const lotes = await getLotesDeArticuloEnCaja(linea.idUbicacionOrigen!, linea.sku, caja.id);
        if (lotes.length > 0) return { linea, ctx: { lotesEnCaja: lotes } };
    }
    return null;
};
