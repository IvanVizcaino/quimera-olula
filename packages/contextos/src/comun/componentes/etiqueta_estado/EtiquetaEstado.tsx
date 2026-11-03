import { EstadoEtiqueta } from "#/comun/diseño.ts";
import "./EtiquetaEstado.css";

/** Píldora de color con el estado de un documento (tabla, tarjeta y detalle). */
export const EtiquetaEstado = ({ texto, tono }: EstadoEtiqueta) => (
  <span className="etiqueta-estado" data-tono={tono}>
    {texto}
  </span>
);
