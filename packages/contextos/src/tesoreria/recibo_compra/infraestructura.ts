import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import { getTotalesReciboListado } from "../comun/totales_recibo.ts";
import { DevolucionReciboCompra, GetReciboCompra, GetRecibosCompra, GetTotalesRecibosCompra, MovimientoReciboCompra, PagoReciboCompra, PatchAnularPagoReciboCompra, PatchDevolverReciboCompra, PatchPagarReciboCompra, ReciboCompra } from "./diseño.js";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";

export interface MovimientoReciboCompraApi {
    id: string;
    fecha: string | null;
    tipo: string;
    estado: boolean;
    cuenta_pago_id?: string | null;
    nombre_cuenta_pago?: string | null;
}

export interface ReciboCompraApi {
    id: string;
    factura_id: string | null;
    codigo: string;
    fecha_emision: string | null;
    fecha_vencimiento: string | null;
    estado: string;
    importe: number;
    proveedor_id: string | null;
    nombre_proveedor: string;
    id_fiscal: string;
    /** Presente cuando el backend extienda el GET con los movimientos de pago. */
    pagos?: MovimientoReciboCompraApi[];
}

const baseUrl = new ApiUrls().RECIBO_COMPRA;

const movimientoDesdeApi = (api: MovimientoReciboCompraApi): MovimientoReciboCompra => ({
    id: api.id,
    fecha: fechaDesdeApi(api.fecha),
    tipo: api.tipo,
    estado: api.estado,
    cuentaPagoId: api.cuenta_pago_id ?? "",
    nombreCuentaPago: api.nombre_cuenta_pago ?? "",
});

export const reciboCompraDesdeApi = (api: ReciboCompraApi): ReciboCompra => ({
    id: api.id,
    facturaId: api.factura_id,
    codigo: api.codigo,
    fechaEmision: fechaDesdeApi(api.fecha_emision),
    fechaVencimiento: fechaDesdeApi(api.fecha_vencimiento),
    estado: api.estado,
    importe: api.importe,
    proveedorId: api.proveedor_id,
    nombreProveedor: api.nombre_proveedor,
    idFiscal: api.id_fiscal,
    pagos: (api.pagos ?? []).map(movimientoDesdeApi),
});

export const getReciboCompra: GetReciboCompra = async (id) => {
    return await RestAPI.getItem<ReciboCompra, ReciboCompraApi>(
        `${baseUrl}/${id}`,
        reciboCompraDesdeApi,
        "Error al obtener el recibo de pago"
    );
};

export const getRecibosCompra: GetRecibosCompra = async (criteria) => {
    return await RestAPI.getQuery<ReciboCompra, ReciboCompraApi>(
        baseUrl,
        criteria,
        reciboCompraDesdeApi,
        "Error al obtener los recibos de pago"
    );
};

export const getTotalesRecibosCompra: GetTotalesRecibosCompra = async (criteria) =>
    getTotalesReciboListado(
        baseUrl,
        criteria,
        "Error al obtener los totales de recibos de pago"
    );

export const getTrazaReciboCompra = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);

export type OrdenPagoReciboCompraApi = {
    /** Solo si `requiere_autorizacion`: página del banco donde autorizar el pago. */
    url: string | null;
    pago_id: string;
    referencia: string;
    requiere_autorizacion: boolean;
    ordenante: { nombre: string; iban: string };
    beneficiario: { nombre: string; iban: string };
};

/** La empresa paga el recibo al proveedor desde su cuenta `cuentaBancoId`. */
export const postOrdenarPagoReciboCompra = async (
    id: string,
    cuentaBancoId: string,
): Promise<OrdenPagoReciboCompraApi> => {
    return await RestAPI.query(
        `${baseUrl}/${id}/ordenar_pago`,
        { cuenta_banco_id: cuentaBancoId },
        "Error al ordenar el pago al proveedor"
    );
};

/** Registra un pago manual del recibo (sin banco): marca el recibo como pagado. */
export const patchPagarReciboCompra: PatchPagarReciboCompra = async (id, pago: PagoReciboCompra) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/pagar`,
        {
            cuenta_pago_id: pago.cuentaPagoId,
            fecha: pago.fecha,
        },
        "Error al pagar el recibo de pago"
    );
};

/** Devuelve un recibo pagado y lo marca como devuelto. */
export const patchDevolverReciboCompra: PatchDevolverReciboCompra = async (id, devolucion: DevolucionReciboCompra) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/devolver`,
        {
            cuenta_pago_id: devolucion.cuentaPagoId,
            fecha: devolucion.fecha,
        },
        "Error al devolver el recibo de pago"
    );
};

/** Anula un pago concreto del recibo (por su pago_id). */
export const patchAnularPagoReciboCompra: PatchAnularPagoReciboCompra = async (id, pagoId) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/anular_pago`,
        { pago_id: pagoId },
        "Error al anular el pago del recibo"
    );
};
