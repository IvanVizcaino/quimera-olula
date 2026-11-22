/**
 * Fiscalidad: series, impuestos, ejercicios fiscales y tablas Veri*Factu
 * (en Eneboo, maestros del módulo principal de facturación).
 */
/** Las tablas Veri*Factu de la AEAT (veri_regimenesiva, veri_causasexencioniva)
 *  solo existen con la firma Veri*Factu: plugin estado_expedicion_factura en
 *  modo firma (o emision, que es firma + factura emitida protegida). */
const PLUGIN_VERIFACTU_FIRMA = { estado_expedicion_factura: ["firma", "emision"] };

export const menuFiscal = {
    Fiscalidad: { icono: "menu_fiscalidad", area: "Finanzas" },
    "Fiscalidad/Ejercicios fiscales": { url: "/fiscal/ejercicio", regla: "contabilidad.asiento" },
    "Fiscalidad/Series": { url: "/fiscal/serie", regla: "comun.serie" },
    "Fiscalidad/Impuestos": { url: "/fiscal/impuesto", regla: "comun.impuesto" },
    "Fiscalidad/Grupos contables Veri*Factu": {
        url: "/fiscal/grupo_iva_negocio",
        regla: "comun.grupo_iva_negocio",
    },
    "Fiscalidad/Regímenes IVA Veri*Factu": {
        url: "/fiscal/regimen_iva_verifactu",
        plugin: PLUGIN_VERIFACTU_FIRMA,
        regla: "comun.regimen_iva_verifactu",
    },
    "Fiscalidad/Causas exención IVA Veri*Factu": {
        url: "/fiscal/causa_exencion_iva",
        plugin: PLUGIN_VERIFACTU_FIRMA,
        regla: "comun.causa_exencion_iva",
    },
};
