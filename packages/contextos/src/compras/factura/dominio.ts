import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { articuloDeLineaValido, decimalesPrecioCompra, getTipoArticulo } from "../comun/dominio.ts";
import {
    Factura,
    ImportacionFactura,
    LineaFactura,
    ModeloLineaFactura,
    NuevaLineaFactura,
} from "./diseño.ts";

export const facturaEditable = (factura: Factura): boolean => factura.editable;

export const descripcionOrigenFactura = (factura: Factura): string =>
    factura.automatica ? "Desde albaranes" : "Manual";

export const etiquetaLinea = (linea: LineaFactura): string =>
    linea.referencia ? `${linea.referencia}: ${linea.descripcion}` : linea.descripcion;

export const lineaDeAlbaran = (linea: LineaFactura): boolean => linea.albaranId !== null;

export const modeloLineaFactura = (linea: LineaFactura): ModeloLineaFactura => ({
    ...linea,
    tipoArticulo: getTipoArticulo(linea),
});

export const metaLineaFactura: MetaModelo<ModeloLineaFactura> = {
    campos: {
        descripcion: { requerido: true },
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        pvpUnitario: { requerido: true, tipo: "moneda", get decimales() { return decimalesPrecioCompra(); } },
        dtoPorcentual: { tipo: "decimal", decimales: 2 },
        dtoLineal: { tipo: "moneda", decimales: 2 },
        tipoIrpf: { tipo: "decimal", decimales: 2 },
        codigoAlbaran: { bloqueado: true },
        pvpSinDto: { tipo: "moneda", bloqueado: true },
        pvpTotal: {
            tipo: "moneda",
            bloqueado: true,
            get decimales() { return decimalesPrecioCompra(); },
        },
        tipoIva: { tipo: "decimal", bloqueado: true },
        tipoRecargo: { tipo: "decimal", bloqueado: true },
    },
    validacion: articuloDeLineaValido,
};

export const metaNuevaLineaFactura: MetaModelo<NuevaLineaFactura> = {
    campos: {
        referencia: { tipo: "texto" },
        descripcion: { tipo: "texto" },
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        pvpUnitario: {
            requerido: (linea) => linea.tipoArticulo === "libre",
            tipo: "moneda",
            get decimales() { return decimalesPrecioCompra(); },
        },
    },
    validacion: articuloDeLineaValido,
};

export const nuevaLineaFacturaVacia = (): NuevaLineaFactura => ({
    tipoArticulo: "registrado",
    referencia: null,
    descripcion: "",
    descripcionArticulo: null,
    cantidad: 1,
    pvpUnitario: null,
});

/** Eneboo `formUTIL.validaDUA`: vacío o exactamente 18 caracteres. */
export const validaDua = (dua: string | null | undefined): boolean =>
    !dua || dua.length === 18;

export const importacionVacia = (): ImportacionFactura => ({
    facturaImportacionId: null,
    facturaDuaId: null,
    dua: null,
    fechaDua: null,
    base: 0,
    tipoIva: 0,
    cuota: 0,
    tratamiento: "Total",
});

/** Solo los campos que el usuario puede cambiar (`factura_dua_id` lo mantiene el sistema). */
export const cambiosImportacion = (
    original: ImportacionFactura | null,
    nueva: ImportacionFactura
): Partial<ImportacionFactura> => {
    const base = original ?? importacionVacia();
    const claves = [
        "facturaImportacionId",
        "dua",
        "fechaDua",
        "base",
        "tipoIva",
        "cuota",
        "tratamiento",
    ] as const;
    const cambios: Record<string, unknown> = {};
    for (const clave of claves) {
        const a = nueva[clave];
        const b = base[clave];
        const igual = a instanceof Date || b instanceof Date
            ? (a as Date | null)?.getTime() === (b as Date | null)?.getTime()
            : a === b;
        if (!igual) cambios[clave] = a;
    }
    return cambios as Partial<ImportacionFactura>;
};

export const metaImportacion: MetaModelo<ImportacionFactura> = {
    campos: {
        facturaImportacionId: {},
        facturaDuaId: { bloqueado: true },
        dua: {},
        fechaDua: { tipo: "fecha" },
        base: { tipo: "moneda", decimales: 2 },
        tipoIva: { tipo: "decimal", decimales: 2 },
        cuota: { tipo: "moneda", decimales: 2 },
        tratamiento: {},
    },
};

/**
 * Facturas elegibles como «factura de importación» (Eneboo
 * `dameFiltroFacturasImport`: `idfacturadua IS NULL`), sin la propia factura.
 */
export const filtroFacturasImportacion = (facturaId: string): ClausulaFiltro[] => [
    ["factura_dua_id", "null"],
    ...(facturaId ? [["id", "!", facturaId] as ClausulaFiltro] : []),
];
