import { plugin } from "@olula/lib/dominio.ts";
import { ConfigTesoreria, ModoPagoRemesa, TipoRemesa } from "./diseño.ts";

/** El modo de las remesas de pago solo existe con su plugin activo (sin él, la BD
 * no tiene sus columnas y el servidor no las lee ni las guarda). */
export const conRemesasPago = (): boolean => plugin("remesa_pago") === "activo";

export const configTesoreriaPorDefecto: ConfigTesoreria = {
    modoCobro: "directo",
    modoPago: "directo",
};

/** En bd son dos flags; el indirecto es una variante del diferido y manda sobre él. */
export const modoDesdeFlags = (diferido: boolean, indirecto: boolean): ModoPagoRemesa =>
    indirecto ? "indirecto" : diferido ? "diferido" : "directo";

export const flagsDesdeModo = (modo: ModoPagoRemesa): { diferido: boolean; indirecto: boolean } => ({
    diferido: modo !== "directo",
    indirecto: modo === "indirecto",
});

export const opcionesModoPagoRemesa: { valor: ModoPagoRemesa; descripcion: string }[] = [
    { valor: "directo", descripcion: "Directo" },
    { valor: "diferido", descripcion: "Diferido" },
    { valor: "indirecto", descripcion: "Indirecto" },
];

const EXPLICACION: Record<TipoRemesa, Record<ModoPagoRemesa, string>> = {
    cobro: {
        directo: "Al remesar, cada recibo queda cobrado con un asiento banco a cliente. "
            + "La remesa no admite pagos.",
        diferido: "Al remesar, los recibos quedan remesados sin asiento. Al registrar el pago "
            + "de la remesa se cobran con un asiento banco a cada cliente.",
        indirecto: "Al remesar, cada recibo queda cobrado con un asiento de efectos comerciales "
            + "en gestión de cobro a cliente. El pago de la remesa genera el asiento banco a "
            + "efectos. Requiere la subcuenta de efectos en la cuenta bancaria.",
    },
    pago: {
        directo: "Al remesar, cada recibo queda pagado con un asiento proveedor a banco. "
            + "La remesa no admite pagos.",
        diferido: "Al remesar, los recibos quedan remesados sin asiento. Al registrar el pago "
            + "de la remesa se pagan con un asiento de cada proveedor a banco.",
        indirecto: "Al remesar, cada recibo queda pagado con un asiento proveedor a efectos "
            + "comerciales en gestión de pago. El pago de la remesa genera el asiento efectos a "
            + "banco. Requiere la subcuenta de efectos en la cuenta bancaria.",
    },
};

export const explicacionModoPagoRemesa = (tipo: TipoRemesa, modo: ModoPagoRemesa): string =>
    EXPLICACION[tipo][modo];
