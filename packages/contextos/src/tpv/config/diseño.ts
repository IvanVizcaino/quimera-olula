export interface TipoTarjeta {
    id: string;
    nombre: string;
    defecto: boolean;
}

export interface ConfigTpv {
    clienteId: string;
    formaPagoEfectivoId: string;
    formaPagoTarjetaId: string;
    formaPagoValeId: string;
    serieId: string;
    tiposTarjeta: TipoTarjeta[];
}

export type GetConfigTpv = () => Promise<ConfigTpv>;
