/** Respuesta de las preguntas «… como borrador» del escritorio. */
export type SiNoPreguntar = "Si" | "No" | "Preguntar";

/**
 * Configuración de ventas: datos generales de facturación del escritorio
 * (tabla `facturac_general`) que afectan a las ventas.
 */
export interface ConfigVentas {
    /** Mostrar observaciones del cliente en documentos de facturación (`avisocliente`). */
    mostrarObservacionesCliente: boolean;
    /** Facturar albaranes como borrador (`firmaralbfacturado`). */
    facturarAlbaranesBorrador: SiNoPreguntar;
    /** Crear facturas como borrador (`crearfacturaborrador`). */
    crearFacturasBorrador: SiNoPreguntar;
    /** Dirección para la copia de correos (`correocopias`); vacía si no hay. */
    correoCopias: string;
}

export type GetConfigVentas = () => Promise<ConfigVentas>;

export type PatchConfigVentas = (config: ConfigVentas) => Promise<void>;
