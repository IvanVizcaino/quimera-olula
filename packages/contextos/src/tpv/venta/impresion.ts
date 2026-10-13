import type { OpcionesTpv } from "../config/diseño.ts";
import type { PagoVentaTpv, VentaTpv } from "./diseño.ts";

export type PlanImpresion = {
    documento: "factura" | "tique" | null;
    vales: string[];
};

// Decide qué se manda a imprimir para una venta. Con las opciones por defecto
// reproduce el comportamiento histórico: factura si hay cliente; si no, tique y
// los vales de los pagos con saldo.
export const planImpresionVenta = (
    venta: Pick<VentaTpv, "cliente" | "total" | "codigo">,
    pagos: PagoVentaTpv[],
    opciones: Pick<OpcionesTpv, "devolucionImprimir">,
    formaPagoValeId: string,
): PlanImpresion => {
    if (venta.cliente) return { documento: "factura", vales: [] };

    const vales = pagos
        .filter((p) => p.vale && p.saldoVale && p.saldoVale > 0)
        .map((p) => p.vale as string);
    const devolucion = venta.total < 0;

    if (!devolucion) return { documento: "tique", vales };

    switch (opciones.devolucionImprimir) {
        case "tique":
            return { documento: "tique", vales: [] };
        case "vale_si_pago_vale_y_tique":
            return { documento: "tique", vales: pagos.some((p) => p.formaPago === formaPagoValeId) ? vales : [] };
        case "vale_si_pago_vale_sin_tique": {
            const pagadoConVale = pagos.some((p) => p.formaPago === formaPagoValeId);
            if (!pagadoConVale) return { documento: "tique", vales };
            const valesDevolucion = vales.length > 0 ? vales : venta.codigo ? [venta.codigo] : [];
            return valesDevolucion.length > 0 ? { documento: null, vales: valesDevolucion } : { documento: "tique", vales: [] };
        }
        default:
            return { documento: "tique", vales };
    }
};

export type PasoSiguienteVenta = "REGALO" | "CONFIRMAR" | "PASAR" | null;

// Primer paso del flujo "pasar a la siguiente venta" tras cobrar o emitir vale.
export const primerPasoSiguienteVenta = (
    _venta: Pick<VentaTpv, "total">,
    opciones: Pick<OpcionesTpv, "pasarSiguienteVentaAuto" | "ticketRegalo" | "confirmarSiguienteVenta">,
): PasoSiguienteVenta => {
    if (!opciones.pasarSiguienteVentaAuto) return null;
    // Eneboo pregunta siempre, sin mirar el importe ni el tipo de documento
    if (opciones.ticketRegalo !== "no_preguntar") return "REGALO";
    return pasoTrasRegalo(opciones);
};

export const pasoTrasRegalo = (
    opciones: Pick<OpcionesTpv, "confirmarSiguienteVenta">,
): PasoSiguienteVenta => (opciones.confirmarSiguienteVenta ? "CONFIRMAR" : "PASAR");
