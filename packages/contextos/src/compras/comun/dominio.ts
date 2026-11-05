import { ConfigWidgets } from "@olula/componentes/index.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
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

/** Franja de datos clave del detalle de un documento de compra. */
export const datosClaveDocumentoCompra = (documento: {
    fecha: Date;
    nombreFormaPago: string | null;
    total: number;
    divisaId: string;
}) => [
    { etiqueta: "Fecha", valor: documento.fecha ? formatearFechaDate(new Date(documento.fecha)) : "—" },
    { etiqueta: "Forma de pago", valor: documento.nombreFormaPago || "—" },
    { etiqueta: "Total", valor: formatearMoneda(documento.total ?? 0, documento.divisaId || "EUR") },
];

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
