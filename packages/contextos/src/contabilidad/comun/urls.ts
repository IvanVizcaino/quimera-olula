class CONTABILIDAD_Urls {
    readonly EJERCICIO = (ejercicioId: string) => `/contabilidad/ejercicio/${encodeURIComponent(ejercicioId)}`;
    readonly ASIENTO = `/contabilidad/asiento`;
    readonly ASIENTO_RENUMERAR = `/contabilidad/asiento/renumerar`;
    readonly PARTIDA = `/contabilidad/asiento/partida`;
    readonly SUBCUENTA = `/contabilidad/subcuenta`;
    readonly CUENTA = `/contabilidad/cuenta`;
    readonly INFORME_MAYOR = `/contabilidad/informe/mayor`;
    readonly INFORME_SUMAS_SALDOS = `/contabilidad/informe/sumas_saldos`;
    readonly INFORME_BALANCE = `/contabilidad/informe/balance`;
    readonly INFORME_LIBRO_FACTURAS_REC_CCaja = `/contabilidad/informe/libro_facturas_recibidas_ccaja`;
    readonly INFORME_LIBRO_FACTURAS_REC_CCaja_REPORT = `/contabilidad/informe/libro_facturas_recibidas_ccaja/report`;
    readonly INFORME_LIBRO_FACTURAS_EMITIDAS = `/contabilidad/informe/libro_facturas_emitidas`;
    readonly INFORME_LIBRO_FACTURAS_RECIBIDAS = `/contabilidad/informe/libro_facturas_recibidas`;
    readonly INFORME_PYG = `/contabilidad/informe/pyg`;
    readonly INFORME_DIARIO = `/contabilidad/informe/diario`;
    readonly INFORME_INGRESOS_GASTOS = `/contabilidad/informe/ingresos_gastos`;
    readonly INFORME_PATRIMONIO = `/contabilidad/informe/patrimonio`;
    readonly INFORME_REPORT = (tipo: string) => `/contabilidad/informe/${tipo}/report`;
    readonly MODELO_303 = `/contabilidad/modelo_303`;
    readonly MODELO_303_ID = (modeloId: number) => `/contabilidad/modelo_303/${modeloId}`;
    readonly MODELO_303_GENERAR = (modeloId: number) =>
        `/contabilidad/modelo_303/${modeloId}/generar`;
    readonly MODELO_303_EXPORT_AEAT = (modeloId: number) =>
        `/contabilidad/modelo_303/${modeloId}/export_aeat`;
    readonly MODELO_347_GENERAR = (modeloId: number) =>
        `/contabilidad/modelo_347/${modeloId}/generar`;
    readonly MODELO_347_DATOS = (modeloId: number) =>
        `/contabilidad/modelo_347/${modeloId}/datos`;
    readonly MODELO_347_INMUEBLES = (modeloId: number) =>
        `/contabilidad/modelo_347/${modeloId}/inmuebles`;
    readonly MODELO_347_INMUEBLE = (modeloId: number) =>
        `/contabilidad/modelo_347/${modeloId}/inmueble`;
    readonly MODELO_347_INMUEBLE_ID = (modeloId: number, registroId: number) =>
        `/contabilidad/modelo_347/${modeloId}/inmueble/${registroId}`;
    readonly MODELO_347_LISTADO = (
        modeloId: number,
        clave: "clientes" | "proveedores" = "clientes",
        orden: "nombre" | "nif" = "nombre",
        nif?: string
    ) => {
        const q = new URLSearchParams({ clave, orden });
        if (nif?.trim()) q.set("nif", nif.trim());
        return `/contabilidad/modelo_347/${modeloId}/listado?${q}`;
    };
    readonly MODELO_347_EXPORT_AEAT = (modeloId: number) =>
        `/contabilidad/modelo_347/${modeloId}/export_aeat`;
    readonly MODELO_349_GENERAR = (modeloId: number) =>
        `/contabilidad/modelo_349/${modeloId}/generar`;
    readonly MODELO_349_DATOS = (modeloId: number) =>
        `/contabilidad/modelo_349/${modeloId}/datos`;
    readonly MODELO_349_EXPORT_AEAT = (modeloId: number) =>
        `/contabilidad/modelo_349/${modeloId}/export_aeat`;
    readonly MODELO_340_GENERAR = (modeloId: number) =>
        `/contabilidad/modelo_340/${modeloId}/generar`;
    readonly MODELO_340_DATOS = (modeloId: number) =>
        `/contabilidad/modelo_340/${modeloId}/datos`;
    readonly MODELO_340_EXPORT_AEAT = (modeloId: number) =>
        `/contabilidad/modelo_340/${modeloId}/export_aeat`;
}

export default CONTABILIDAD_Urls;
