class CONTABILIDAD_Urls {
    readonly ASIENTO = `/contabilidad/asiento`;
    readonly ASIENTO_RENUMERAR = `/contabilidad/asiento/renumerar`;
    readonly PARTIDA = `/contabilidad/asiento/partida`;
    readonly ASIENTO_DESDE_PLANTILLA = `/contabilidad/asiento/desde_plantilla`;
    readonly ASIENTO_DESDE_PLANTILLA_CALCULAR = `/contabilidad/asiento/desde_plantilla/calcular`;
    readonly PLANTILLA_ASIENTO = `/contabilidad/plantilla_asiento`;
    readonly SUBCUENTA = `/contabilidad/subcuenta`;
    readonly CUENTA = `/contabilidad/cuenta`;
    readonly CUENTA_ESPECIAL = `/contabilidad/cuenta_especial`;
    readonly CODIGO_BALANCE = `/contabilidad/codigo_balance`;
    readonly CODIGO_BALANCE_REGENERAR = `/contabilidad/codigo_balance/regenerar`;
    readonly CODIGO_BALANCE_SALDO = (ejercicioId: string) =>
        `/contabilidad/codigo_balance/saldo/${encodeURIComponent(ejercicioId)}`;
    readonly CUENTA_CODIGO_BALANCE = `/contabilidad/cuenta_codigo_balance`;
    readonly CUENTA_CODIGO_BALANCE_ABREVIADO = `/contabilidad/cuenta_codigo_balance_abreviado`;
    readonly GRUPO_EPIGRAFE = `/contabilidad/grupo_epigrafe`;
    readonly GRUPO_CONTABLE_AMORTIZACION = `/contabilidad/grupo_contable_amortizacion`;
    readonly AMORTIZACION = `/contabilidad/amortizacion`;
    readonly AMORTIZACION_DOTACION = `/contabilidad/amortizacion/dotacion`;
    readonly AMORTIZACION_REGULARIZACION_VALOR = `/contabilidad/amortizacion/regularizacion_valor`;
    readonly AMORTIZACION_GENERAR_DOTACIONES = `/contabilidad/amortizacion/generar_dotaciones`;
    readonly AMORTIZACION_DESHACER_DOTACIONES = `/contabilidad/amortizacion/deshacer_dotaciones`;
    readonly AMORTIZACION_INFORME = `/contabilidad/amortizacion/informe`;
    readonly AMORTIZACION_INFORME_REPORT = `/contabilidad/amortizacion/informe/report`;
    readonly EPIGRAFE = `/contabilidad/epigrafe`;
    readonly LIBRO_DIARIO = `/contabilidad/libro_diario`;
    readonly LIBRO_DIARIO_DATOS = (id: string) =>
        `/contabilidad/libro_diario/${id}/datos`;
    readonly LIBRO_DIARIO_REPORT = (id: string) =>
        `/contabilidad/libro_diario/${id}/report`;
    readonly LIBRO_MAYOR = `/contabilidad/libro_mayor`;
    readonly LIBRO_MAYOR_DATOS = (id: string) =>
        `/contabilidad/libro_mayor/${id}/datos`;
    readonly LIBRO_MAYOR_REPORT = (id: string) =>
        `/contabilidad/libro_mayor/${id}/report`;
    readonly LIBRO_FACTURAS_EMITIDAS = `/contabilidad/libro_facturas_emitidas`;
    readonly LIBRO_FACTURAS_EMITIDAS_DATOS = (id: string) =>
        `/contabilidad/libro_facturas_emitidas/${id}/datos`;
    readonly LIBRO_FACTURAS_EMITIDAS_REPORT = (id: string) =>
        `/contabilidad/libro_facturas_emitidas/${id}/report`;
    readonly LIBRO_FACTURAS_RECIBIDAS = `/contabilidad/libro_facturas_recibidas`;
    readonly LIBRO_FACTURAS_RECIBIDAS_DATOS = (id: string) =>
        `/contabilidad/libro_facturas_recibidas/${id}/datos`;
    readonly LIBRO_FACTURAS_RECIBIDAS_REPORT = (id: string) =>
        `/contabilidad/libro_facturas_recibidas/${id}/report`;
    readonly CUENTAS_ANUALES = `/contabilidad/cuentas_anuales`;
    readonly CUENTAS_ANUALES_BALANCE = (id: string) =>
        `/contabilidad/cuentas_anuales/${id}/balance`;
    readonly CUENTAS_ANUALES_REPORT = (id: string) =>
        `/contabilidad/cuentas_anuales/${id}/report`;
    readonly CUENTAS_ANUALES_HOJA = (id: string, formato: string) =>
        `/contabilidad/cuentas_anuales/${id}/hoja?formato=${formato}`;
    readonly PATRIMONIO_NETO = `/contabilidad/patrimonio_neto`;
    readonly PATRIMONIO_NETO_DATOS = (id: string) =>
        `/contabilidad/patrimonio_neto/${id}/datos`;
    readonly PATRIMONIO_NETO_REPORT = (id: string) =>
        `/contabilidad/patrimonio_neto/${id}/report`;
    readonly PATRIMONIO_NETO_HOJA = (id: string, formato: string) =>
        `/contabilidad/patrimonio_neto/${id}/hoja?formato=${formato}`;
    readonly REGULARIZACION_IVA = `/contabilidad/regularizacion_iva`;
    readonly EJERCICIO = `/contabilidad/ejercicio`;
    readonly EJERCICIO_ALTA = `/comun/ejercicio_facturacion`;
}

export default CONTABILIDAD_Urls;
