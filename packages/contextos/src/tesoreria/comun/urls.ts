class Tesoreria_Urls {
    readonly REMESA = `/tesoreria/remesa_cobro`;
    /** Requiere extensión Eneboo `remesas_prov` en la BD del cliente. */
    readonly REMESA_PAGO = `/tesoreria/remesa_pago`;
    readonly MANDATO = `/tesoreria/mandato`;
    readonly RECIBO_VENTA = `/tesoreria/recibo_cobro`;
    readonly RECIBO_COMPRA = `/tesoreria/recibo_pago`;
    readonly CONEXION_BANCARIA = `/tesoreria/conexion_bancaria`;
    readonly MOVIMIENTO_BANCARIO = `/tesoreria/movimiento_bancario`;
}

export default Tesoreria_Urls;
