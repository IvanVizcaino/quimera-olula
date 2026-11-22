import { ConfigWidgets } from "@olula/componentes/index.js";
import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { ArticuloDeLinea, ArticuloDeLineaConTipo, TipoArticuloLinea } from "./diseño.ts";

export const getTipoArticulo = (linea: ArticuloDeLinea): TipoArticuloLinea =>
    linea.referencia
        ? linea.descripcion === linea.descripcionArticulo
            ? "registrado"
            : "generico"
        : "libre";

export const articuloDeLineaValido = (linea: ArticuloDeLineaConTipo): boolean => {
    switch (linea.tipoArticulo) {
        case "registrado":
            return !!linea.referencia;
        case "generico":
            return !!linea.referencia && !!linea.descripcion;
        case "libre":
            return !!linea.descripcion;
    }
};

/** Documento de compra tal y como lo necesita la franja de datos clave. */
export type DocumentoCompraDatosClave = {
    fecha: Date;
    nombreProveedor?: string | null;
    idFiscal?: string | null;
    grupoIvaNegocioId?: string | null;
};

/**
 * Franja de datos clave del detalle de un documento de compra (pedido, albarán y
 * factura): Fecha · Proveedor · CIF/NIF · Grupo IVA negocio.
 *
 * Nombre y CIF/NIF son los del documento (también para proveedores no
 * registrados). El grupo de IVA se muestra con su descripción si
 * `descripcionGrupoIvaNegocio` la conoce (si no, con el código). A diferencia de
 * ventas, se muestra siempre: en compras el grupo llega también con
 * `iva_nav=legacy` (de la ficha del proveedor), igual que en la pestaña Datos.
 */
export const datosClaveDocumentoCompra = (
    documento: DocumentoCompraDatosClave,
    descripcionGrupoIvaNegocio: (id: string) => string | undefined = () => undefined,
) => {
    const grupo = documento.grupoIvaNegocioId ?? "";

    return [
        { etiqueta: "Fecha", valor: documento.fecha ? formatearFechaDate(new Date(documento.fecha)) : "—" },
        { etiqueta: "Proveedor", valor: documento.nombreProveedor?.trim() || "—" },
        { etiqueta: "CIF/NIF", valor: documento.idFiscal?.trim() || "—" },
        { etiqueta: "Grupo IVA negocio", valor: (grupo && descripcionGrupoIvaNegocio(grupo)) || grupo || "—" },
    ];
};

/** Medidas de un documento de compra que se ofrecen al personalizar widgets. */
const camposWidgetsCompra: ConfigWidgets["campos"] = [
    { id: "total", etiqueta: "Total", formato: "moneda" },
    { id: "neto", etiqueta: "Base imponible", formato: "moneda" },
    { id: "total_iva", etiqueta: "IVA", formato: "moneda" },
    { id: "total_irpf", etiqueta: "IRPF", formato: "moneda" },
    { id: "total_recargo", etiqueta: "Recargo de equivalencia", formato: "moneda" },
];

/** Widgets por defecto de un maestro de documentos de compra. */
export const widgetsDocumentoCompra = (
    recurso: string,
    textos: { plural: string; total: string; medio: string }
): ConfigWidgets => ({
    recurso,
    titulo: textos.plural,
    campos: camposWidgetsCompra,
    widgets: [
        { id: "documentos", titulo: textos.plural, operacion: "conteo", formato: "numero", pie: "Recuento" },
        { id: "total", titulo: textos.total, operacion: "suma", campo: "total", formato: "moneda", pie: "Suma del total" },
        { id: "neto", titulo: "Base imponible", operacion: "suma", campo: "neto", formato: "moneda", pie: "Suma de la base" },
        { id: "medio", titulo: textos.medio, operacion: "promedio", campo: "total", formato: "moneda", pie: "Media del total" },
    ],
});

/**
 * Al cambiar el artículo de una línea nueva, el servidor vuelve a calcular el coste y, si se
 * ha elegido un artículo, el impuesto: la línea toma el del artículo aunque llevase el I.V.A.
 * por defecto o el de otro artículo (como lineas*prov.qs al cambiar la referencia).
 */
export const reinicioAlCambiarArticulo = (cambios: { referencia?: string | null }) => ({
    ...(cambios.referencia !== undefined ? { pvpUnitario: null } : {}),
    ...(cambios.referencia ? { grupoIvaProductoId: null } : {}),
});
