import { CSSProperties, ReactNode } from "react";
import "./FilaFormulario.css";

/**
 * Varios campos en la misma fila de un `<quimera-formulario>`: la fila ocupa
 * las 12 columnas de la rejilla y reparte el ancho entre sus campos, a partes
 * iguales o según `columnas` (un `grid-template-columns`, p. ej.
 * "1fr 2fr"). En móvil los campos van uno debajo de otro, como el resto del
 * formulario.
 */
export const FilaFormulario = ({
    children,
    columnas,
}: {
    children: ReactNode;
    columnas?: string;
}) => (
    <div
        className="FilaFormulario"
        style={
            columnas
                ? ({ "--columnas-fila": columnas } as CSSProperties)
                : undefined
        }
    >
        {children}
    </div>
);
