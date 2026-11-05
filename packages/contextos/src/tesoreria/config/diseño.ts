/**
 * Cómo se pagan las remesas (tabla `factteso_general`), como en el escritorio:
 * - directo: cada recibo se paga y se contabiliza contra el banco al remesarlo;
 *   la remesa no tiene pagos.
 * - diferido: los recibos quedan remesados sin asiento; el pago de la remesa los
 *   paga y los contabiliza contra el banco.
 * - indirecto: cada recibo se paga al remesarlo contra la subcuenta de efectos
 *   comerciales en gestión de cobro (o de pago); el pago de la remesa salda esos
 *   efectos contra el banco.
 */
export type ModoPagoRemesa = "directo" | "diferido" | "indirecto";

export type TipoRemesa = "cobro" | "pago";

export interface ConfigTesoreria {
    modoCobro: ModoPagoRemesa;
    modoPago: ModoPagoRemesa;
}

export type GetConfigTesoreria = () => Promise<ConfigTesoreria>;

export type PatchConfigTesoreria = (config: ConfigTesoreria) => Promise<void>;
