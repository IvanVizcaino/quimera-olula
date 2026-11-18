import { LineaOrdenAlmacen, OrdenAlmacen } from "../diseño.ts";
import { DefinicionPasos, FaseLectura } from "./diseño.ts";

type Def = Omit<DefinicionPasos, "codigo" | "fase" | "directo" | "serie" | "palet"> &
    Partial<Pick<DefinicionPasos, "directo" | "serie" | "palet">>;

const crear = (fase: FaseLectura, defs: Record<string, Def>): Record<string, DefinicionPasos> =>
    Object.fromEntries(
        Object.entries(defs).map(([codigo, d]) => [
            codigo,
            { directo: false, serie: null, palet: false, ...d, codigo, fase },
        ])
    );

export const CATALOGO_DROP: Record<string, DefinicionPasos> = crear("DROP", {
    "SKU-CANTIDAD": {
        nombre: "SKU → Cantidad → Ubicación o caja",
        instruccion: "lee el SKU, la cantidad y la ubicación o caja de destino",
        origen: null, que: "SKU_O_LOTE", cantidad: "LEER", destino: "UBI_O_CAJA", manejoCaja: null,
    },
    "LOTE-CANTIDAD": {
        nombre: "Lote → Cantidad → Ubicación o caja",
        instruccion: "lee el lote, la cantidad y la ubicación o caja de destino",
        origen: null, que: "LOTE", cantidad: "LEER", destino: "UBI_O_CAJA", manejoCaja: null,
    },
    "SKU_LOTE-CANTIDAD": {
        nombre: "SKU/Lote → Cantidad",
        instruccion: "lee el SKU, lote y cantidad",
        origen: null, que: "SKU_O_LOTE", cantidad: "LEER", destino: "LINEA", manejoCaja: null,
    },
    "CAJAS": {
        nombre: "Leer cajas",
        instruccion: "lee la caja",
        origen: null, que: "LINEA", cantidad: "CAPACIDAD_CAJA_DESTINO", destino: "CAJA", manejoCaja: null,
        palet: true,
    },
    "PALET": {
        nombre: "Leer palés",
        instruccion: "lee el palet",
        origen: null, que: "CAJA", cantidad: "CONTENIDO_CAJA", destino: "LINEA", manejoCaja: "COMPLETA",
        palet: true,
    },
    "CAJAS-UBICACION": {
        nombre: "Caja → Ubicación",
        instruccion: "lee la caja y la ubicación de destino",
        origen: null, que: "CAJA", cantidad: "CONTENIDO_CAJA", destino: "UBI", manejoCaja: "COMPLETA",
        serie: "QUE", palet: true,
    },
    "SKU-UBICACION": {
        nombre: "SKU → Cantidad → Ubicación",
        instruccion: "lee el SKU, la cantidad y la ubicación de destino",
        origen: null, que: "SKU_O_LOTE", cantidad: "LEER", destino: "UBI", manejoCaja: null,
    },
});

export const CATALOGO_PICK: Record<string, DefinicionPasos> = crear("PICK", {
    "SKU_CAJA": {
        nombre: "Caja o SKU suelto",
        instruccion: "lee la caja o el SKU suelto",
        origen: "UBI_O_CAJA", que: "SKU", cantidad: "PENDIENTE", destino: "NINGUNO", manejoCaja: "EXTRAER",
    },
    "LOTE_CAJA": {
        nombre: "Caja o lote suelto",
        instruccion: "lee la caja o el lote suelto",
        origen: "UBI_O_CAJA", que: "LOTE", cantidad: "PENDIENTE", destino: "NINGUNO", manejoCaja: "EXTRAER",
    },
    "LOTE-CAJAS": {
        nombre: "Palé c/lotes → cajas etiqueta",
        instruccion: "lee el lote de la subcaja y la nueva caja",
        origen: "LINEA", que: "LOTE", cantidad: "CAPACIDAD_SUBCAJA", destino: "CAJA_ETIQUETA", manejoCaja: "EXTRAER",
        serie: "DESTINO",
    },
    "CAJA-CAJAS": {
        nombre: "Palé s/lotes → cajas etiqueta",
        instruccion: "lee el palé y las nuevas cajas",
        origen: "CAJA", que: "CAJA", cantidad: "CAPACIDAD_SUBCAJA", destino: "CAJA_ETIQUETA", manejoCaja: "EXTRAER",
        serie: "DESTINO",
    },
    "CAJAS": {
        nombre: "Recoger cajas completas",
        instruccion: "lee la caja",
        origen: "CAJA", que: "CAJA", cantidad: "CONTENIDO_CAJA", destino: "NINGUNO", manejoCaja: "COMPLETA",
    },
    "CAJA-CANTIDAD": {
        nombre: "Caja → Cantidad (directo)",
        instruccion: "lee la caja y la cantidad",
        origen: "CAJA", que: "CAJA", cantidad: "LEER", destino: "LINEA", manejoCaja: "EXTRAER",
        directo: true,
    },
});

const catalogo = (fase: FaseLectura) => (fase === "PICK" ? CATALOGO_PICK : CATALOGO_DROP);

export const definicion = (codigo: string | null, fase: FaseLectura): DefinicionPasos | null =>
    codigo ? (catalogo(fase)[codigo] ?? null) : null;

/** Código de pasos que aplica a una línea: el suyo o, si no tiene, el de la cabecera. */
export const pasosEfectivos = (
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    fase: FaseLectura,
): string | null =>
    fase === "PICK"
        ? (linea.pasosPick ?? orden.pasosPick)
        : (linea.pasosDrop ?? orden.pasosDrop);

/**
 * Definición que aplica a una línea en una fase. Las entradas antiguas sin
 * pasos de drop se leen como "CAJAS" (lectura de cajas de entrada).
 */
export const definicionDeLinea = (
    linea: LineaOrdenAlmacen,
    orden: OrdenAlmacen,
    fase: FaseLectura,
): DefinicionPasos | null => {
    const codigo = pasosEfectivos(linea, orden, fase);
    if (!codigo && fase === "DROP" && orden.tipo === "ENTRADA") return CATALOGO_DROP["CAJAS"];
    return definicion(codigo, fase);
};

/** La línea se recoge en una fase PICK separada (no directa). */
export const tieneFasePick = (linea: LineaOrdenAlmacen, orden: OrdenAlmacen): boolean => {
    const codigo = pasosEfectivos(linea, orden, "PICK");
    return !!codigo && !(definicion(codigo, "PICK")?.directo ?? false);
};

/** La línea tiene fase DROP (o es una entrada, que siempre la tiene). */
export const tieneFaseDrop = (linea: LineaOrdenAlmacen, orden: OrdenAlmacen): boolean =>
    definicionDeLinea(linea, orden, "DROP") !== null;

/** Texto de instrucción para un código; si no está en el catálogo, el propio código. */
export const instruccionPasos = (codigo: string, fase: FaseLectura): string =>
    definicion(codigo, fase)?.instruccion ?? codigo;
