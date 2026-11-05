export type PagoRecibo = {
    cuenta_pago_id: string;
    nombre_cuenta_pago: string;
    fecha: Date;
    /** Solo se pide si el recibo no está en la divisa de la empresa. */
    tasa_conversion: number;
};
