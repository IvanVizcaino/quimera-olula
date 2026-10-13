import type { OpcionesTpvAPI } from "./infraestructura.ts";
import type { BotonTpv, OpcionesTpv } from "./diseño.ts";

// Valores por defecto: los mismos que devuelve el backend (OPCIONES_TPV_POR_DEFECTO)
// y los que se usan si `GET /tpv/config` no trae `opciones`.
export const opcionesTpvPorDefecto: OpcionesTpv = {
    botonesOcultos: [],
    ticketRegalo: "no_preguntar",
    devolucionImprimir: "vale_si_pago_vale_y_tique",
    emitirValeReimprimeTique: true,
    emitirValeAvanzaSiempre: false,
    imprimirTiqueAlCobrar: true,
    abrirCajonAlCobrar: false,
    pasarSiguienteVentaAuto: false,
    confirmarSiguienteVenta: true,
};

const ticketsRegalo = ["preguntar_en_bucle", "preguntar_una_vez", "no_preguntar"];
const devoluciones = ["tique", "vale_si_pago_vale_y_tique", "vale_si_pago_vale_sin_tique"];

export const completarOpcionesTpv = (o?: OpcionesTpvAPI | null): OpcionesTpv => {
    const d = opcionesTpvPorDefecto;
    if (!o) return { ...d, botonesOcultos: [...d.botonesOcultos] };
    return {
        botonesOcultos: Array.isArray(o.botones_ocultos) ? [...o.botones_ocultos] : [],
        ticketRegalo: ticketsRegalo.includes(o.ticket_regalo ?? "")
            ? (o.ticket_regalo as OpcionesTpv["ticketRegalo"])
            : d.ticketRegalo,
        devolucionImprimir: devoluciones.includes(o.devolucion_imprimir ?? "")
            ? (o.devolucion_imprimir as OpcionesTpv["devolucionImprimir"])
            : d.devolucionImprimir,
        emitirValeReimprimeTique: o.emitir_vale_reimprime_tique ?? d.emitirValeReimprimeTique,
        emitirValeAvanzaSiempre: o.emitir_vale_avanza_siempre ?? d.emitirValeAvanzaSiempre,
        imprimirTiqueAlCobrar: o.imprimir_tique_al_cobrar ?? d.imprimirTiqueAlCobrar,
        abrirCajonAlCobrar: o.abrir_cajon_al_cobrar ?? d.abrirCajonAlCobrar,
        pasarSiguienteVentaAuto: o.pasar_siguiente_venta_auto ?? d.pasarSiguienteVentaAuto,
        confirmarSiguienteVenta: o.confirmar_siguiente_venta ?? d.confirmarSiguienteVenta,
    };
};

export const botonOculto = (opciones: OpcionesTpv, boton: BotonTpv): boolean =>
    opciones.botonesOcultos.includes(boton);
