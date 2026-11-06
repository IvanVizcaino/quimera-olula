class CONTABILIDAD_Urls {
    readonly ASIENTO = `/contabilidad/asiento`;
    readonly ASIENTO_RENUMERAR = `/contabilidad/asiento/renumerar`;
    readonly PARTIDA = `/contabilidad/asiento/partida`;
    readonly SUBCUENTA = `/contabilidad/subcuenta`;
    readonly CUENTA = `/contabilidad/cuenta`;
    readonly CUENTA_ESPECIAL = `/contabilidad/cuenta_especial`;
    readonly GRUPO_EPIGRAFE = `/contabilidad/grupo_epigrafe`;
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
}

export default CONTABILIDAD_Urls;
