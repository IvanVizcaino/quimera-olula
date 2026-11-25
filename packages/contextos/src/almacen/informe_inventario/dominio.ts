import { formatearFechaString, formatearNumero } from "@olula/lib/dominio.ts";
import { FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { FormatoHoja, ResultadoInventario } from "./diseño.ts";

/** Nombre del fichero descargado: clave del informe y descripción de la ficha. */
export const nombreFicheroInventario = (
    pestaña: Pick<PestañaInforme, "clave">,
    ficha: Pick<FichaInforme, "descripcion">,
    extension: "pdf" | FormatoHoja
): string => {
    const base = `${pestaña.clave}-${ficha.descripcion || "informe"}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${base}.${extension}`;
};

/** Línea bajo el título: fecha del stock y, en el valorado, la valoración. */
export const criteriosResultado = (resultado: ResultadoInventario): string => {
    const partes = [resultado.fecha ? `Stock a ${formatearFechaString(resultado.fecha)}` : "Stock actual"];
    if (resultado.valorado && resultado.tipoValoracion) {
        const recargo = resultado.porPvp ? ` + ${formatearNumero(resultado.porPvp)} %` : "";
        partes.push(`Valoración: ${resultado.tipoValoracion}${recargo}`);
    }
    const articulos = resultado.totalArticulos;
    partes.push(`${formatearNumero(articulos)} ${articulos === 1 ? "artículo" : "artículos"}`);
    return partes.join(" · ");
};

/** Importe con dos decimales (precio, valor y totales); vacío si no hay. */
export const importe = (valor: number | null): string =>
    valor === null ? "" : formatearNumero(valor, 2);

/** Cantidad en formato español, con los decimales que tenga. */
export const cantidad = (valor: number): string => formatearNumero(valor);
