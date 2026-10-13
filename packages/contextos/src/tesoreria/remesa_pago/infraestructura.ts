import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import {
    AsociarRecibosRemesaPago,
    DeshacerPagoRemesaPago,
    ExcluirReciboRemesaPago,
    GetExportFicheroRemesaPago,
    GetRemesaPago,
    GetRemesasPago,
    MovimientoRemesaPago,
    PagarRemesaPago,
    PostRemesaPago,
    ReciboDeRemesaPago,
    RemesaPago,
} from "./diseño.js";
import { FORMATO_EXPORT_FICHERO_REMESA_PAGO } from "./dominio.js";

interface MovimientoRemesaPagoApi {
    id: string;
    fecha: string | null;
    tipo: string;
}

interface ReciboDeRemesaPagoApi {
    id: string;
    codigo: string;
    fecha_vencimiento: string | null;
    estado: string;
    importe: number;
    proveedor_id: string | null;
    nombre_proveedor: string;
    pagos?: MovimientoRemesaPagoApi[];
}

export interface RemesaPagoApi {
    id: string;
    fecha: string | null;
    fecha_cargo: string | null;
    total: number;
    divisa_id: string;
    cuenta_id: string;
    estado: string | null;
    empresa_id: string | null;
    recibos?: ReciboDeRemesaPagoApi[];
    pagos?: MovimientoRemesaPagoApi[];
}

const baseUrl = new ApiUrls().REMESA_PAGO;

const movimientoDesdeApi = (api: MovimientoRemesaPagoApi): MovimientoRemesaPago => ({
    id: api.id,
    fecha: fechaDesdeApi(api.fecha),
    tipo: api.tipo,
});

const reciboDeRemesaDesdeApi = (api: ReciboDeRemesaPagoApi): ReciboDeRemesaPago => ({
    id: api.id,
    codigo: api.codigo,
    fechaVencimiento: fechaDesdeApi(api.fecha_vencimiento),
    estado: api.estado,
    importe: api.importe,
    proveedorId: api.proveedor_id ?? "",
    nombreProveedor: api.nombre_proveedor,
    pagos: (api.pagos ?? []).map(movimientoDesdeApi),
});

export const remesaPagoDesdeApi = (api: RemesaPagoApi): RemesaPago => ({
    id: api.id,
    fecha: fechaDesdeApi(api.fecha),
    fechaCargo: fechaDesdeApi(api.fecha_cargo),
    total: api.total,
    divisaId: api.divisa_id,
    cuentaId: api.cuenta_id,
    estado: api.estado ?? "",
    empresaId: api.empresa_id ?? "",
    recibos: (api.recibos ?? []).map(reciboDeRemesaDesdeApi),
    pagos: (api.pagos ?? []).map(movimientoDesdeApi),
});

export const getRemesaPago: GetRemesaPago = async (id) => {
    return await RestAPI.getItem<RemesaPago, RemesaPagoApi>(
        `${baseUrl}/${id}`,
        remesaPagoDesdeApi,
        "Error al obtener la remesa de pago"
    );
};

export const getRemesasPago: GetRemesasPago = async (criteria) => {
    return await RestAPI.getQuery<RemesaPago, RemesaPagoApi>(
        baseUrl,
        criteria,
        remesaPagoDesdeApi,
        "Error al obtener las remesas de pago"
    );
};

export const postRemesaPago: PostRemesaPago = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { cuenta_id: nueva.cuentaId, recibo_ids: nueva.reciboIds },
        "Error al crear la remesa de pago"
    );

    return String(respuesta.id);
};

export const pagarRemesaPago: PagarRemesaPago = async (id, datos) => {
    await RestAPI.post(
        `${baseUrl}/${id}/pagar`,
        {
            fecha: datos.fecha,
            iban: datos.iban || null,
            numero_cheque: datos.numeroCheque || null,
        },
        "Error al pagar la remesa de pago"
    );
};

export const deshacerPagoRemesaPago: DeshacerPagoRemesaPago = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}/pago`,
        "Error al deshacer el pago de la remesa de pago"
    );
};

export const patchAsociarRecibosRemesaPago: AsociarRecibosRemesaPago = async (
    id,
    reciboIds
) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/asociar_recibos`,
        { recibo_ids: reciboIds },
        "Error al asociar recibos a la remesa de pago"
    );
};

export const patchExcluirReciboRemesaPago: ExcluirReciboRemesaPago = async (
    id,
    reciboId
) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/excluir_recibo`,
        { recibo_id: reciboId },
        "Error al excluir el recibo de la remesa de pago"
    );
};

export const getExportFicheroRemesaPago: GetExportFicheroRemesaPago = async (
    id,
    formato = FORMATO_EXPORT_FICHERO_REMESA_PAGO,
) =>
    RestAPI.blob(
        `${baseUrl}/${id}/export_fichero?formato=${formato}`,
        "Error al descargar fichero bancario de la remesa de pago"
    );
