/** Lo que el formulario del ERP deja cambiar de un recibo (TES-06). */
export type CambiosRecibo = {
    fecha_vencimiento: Date;
    cuenta_domiciliacion_id: string;
    importe: number;
};

/** Fecha local en formato ISO (sin pasar por UTC). */
export const fechaApi = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
