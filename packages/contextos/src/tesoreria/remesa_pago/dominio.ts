import { configuracion } from "@olula/lib/dominio.ts";
import { RemesaPago } from "./diseño.ts";

export const esRemesaDeNominas = (remesa: RemesaPago): boolean =>
    remesa.tipo === "Nóminas";

export const remesaPagoConPago = (remesa: RemesaPago): boolean =>
    remesa.pagos.length > 0;

/** Con pago directo de remesas de pago (Tesorería / Configuración) los recibos
 * se pagan y contabilizan al remesarlos: la remesa de recibos no tiene pagos. */
export const pagoDirectoRemesasPago = (): boolean =>
    !configuracion("tesoreria.pago_diferido_prov") && !configuracion("tesoreria.pago_indirecto_prov");

/** Las nóminas se pagan siempre con el pago de la remesa, sea cual sea el modo. */
export const remesaPagoAdmitePagos = (
    remesa: RemesaPago,
    pagoDirecto: () => boolean = pagoDirectoRemesasPago,
): boolean => esRemesaDeNominas(remesa) || !pagoDirecto();

/** El pago es siempre total: una remesa se paga una vez, entera. */
export const remesaPagoPagable = (
    remesa: RemesaPago,
    pagoDirecto: () => boolean = pagoDirectoRemesasPago,
): boolean =>
    !!remesa.id && !remesaPagoConPago(remesa) && remesaPagoAdmitePagos(remesa, pagoDirecto);

export type VarianteEstadoRemesaPago = "neutro" | "exito";

const VARIANTES_ESTADO_REMESA_PAGO: Record<string, VarianteEstadoRemesaPago> = {
    emitida: "neutro",
    pagada: "exito",
};

export const varianteEstadoRemesaPago = (estado: string): VarianteEstadoRemesaPago =>
    VARIANTES_ESTADO_REMESA_PAGO[estado.trim().toLowerCase()] ?? "neutro";

/** Fecha local en formato ISO (AAAA-MM-DD), sin pasar por UTC. */
export const fechaIso = (fecha: Date): string =>
    [
        fecha.getFullYear(),
        String(fecha.getMonth() + 1).padStart(2, "0"),
        String(fecha.getDate()).padStart(2, "0"),
    ].join("-");
