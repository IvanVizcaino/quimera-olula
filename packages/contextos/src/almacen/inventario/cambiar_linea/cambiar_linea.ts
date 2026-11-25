import { LineaInventario, NuevaLineaInventario } from "../diseño.ts";

/** Valores iniciales del modal de cambio: la cantidad contada actual de la línea. */
export const lineaACambios = (linea: LineaInventario): NuevaLineaInventario => ({
    articuloId: linea.articuloId,
    cantidad: linea.cantidadFinal,
    motivo: linea.motivo ?? "",
});
