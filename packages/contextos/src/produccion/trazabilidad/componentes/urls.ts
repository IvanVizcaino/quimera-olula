/** Enlaces de la trazabilidad a las fichas. */
const q = encodeURIComponent;

export const urlOrdenProduccion = (id: string): string => `/produccion/ordenes?id=${q(id)}`;
export const urlLote = (id: string): string => `/almacen/lotes?id=${q(id)}`;
export const urlTrazabilidadLote = (id: string): string => `/produccion/trazabilidad?lote=${q(id)}`;
