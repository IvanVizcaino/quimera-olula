/** Longitud de `articulos.referencia` en el escritorio (articulos.mtd). */
export const LONGITUD_REFERENCIA_ARTICULO = 18;

/** La referencia del artículo nuevo: obligatoria y como mucho 18 caracteres, como en Eneboo. */
export const referenciaArticuloValida = (referencia: string | undefined): boolean | string => {
    const valor = (referencia ?? "").trim();
    if (!valor) return "La referencia es obligatoria";
    if (valor.length > LONGITUD_REFERENCIA_ARTICULO)
        return `La referencia admite como mucho ${LONGITUD_REFERENCIA_ARTICULO} caracteres`;
    return true;
};
