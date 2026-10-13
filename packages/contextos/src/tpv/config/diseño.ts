export interface TipoTarjeta {
    id: string;
    nombre: string;
    defecto: boolean;
}

export type TicketRegaloTpv = "preguntar_en_bucle" | "preguntar_una_vez" | "no_preguntar";

export type DevolucionImprimirTpv =
    | "tique"
    | "vale_si_pago_vale_y_tique"
    | "vale_si_pago_vale_sin_tique";

export type BotonTpv = "uno_mas" | "uno_menos" | "descuento";

export interface OpcionesTpv {
    botonesOcultos: string[];
    ticketRegalo: TicketRegaloTpv;
    devolucionImprimir: DevolucionImprimirTpv;
    emitirValeReimprimeTique: boolean;
    emitirValeAvanzaSiempre: boolean;
    imprimirTiqueAlCobrar: boolean;
    abrirCajonAlCobrar: boolean;
    pasarSiguienteVentaAuto: boolean;
    confirmarSiguienteVenta: boolean;
}

export interface ConfigTpv {
    clienteId: string;
    formaPagoEfectivoId: string;
    formaPagoTarjetaId: string;
    formaPagoValeId: string;
    serieId: string;
    tiposTarjeta: TipoTarjeta[];
    opciones: OpcionesTpv;
}

export type GetConfigTpv = () => Promise<ConfigTpv>;
