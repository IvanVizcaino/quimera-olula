import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import {
    DeshacerPagoRemesa,
    GetRemesa,
    GetRemesas,
    MovimientoRemesa,
    PagarRemesa,
    PostRemesa,
    ReciboDeRemesa,
    Remesa,
} from "./diseño.js";

interface MovimientoRemesaApi {
    id: string;
    fecha: string | null;
    tipo: string;
}

interface ReciboDeRemesaApi {
    id: string;
    codigo: string;
    fecha_vencimiento: string | null;
    estado: string;
    situacion: string;
    importe: number;
    cliente_id: string;
    nombre_cliente: string;
    pagos?: MovimientoRemesaApi[];
}

export interface RemesaApi {
    id: string;
    fecha: string | null;
    fecha_cargo: string | null;
    total: number;
    divisa_id: string;
    cuenta_id: string;
    descripcion_cuenta?: string;
    estado: string;
    empresa_id: string;
    recibos?: ReciboDeRemesaApi[];
    pagos?: MovimientoRemesaApi[];
}

const baseUrl = new ApiUrls().REMESA;

const movimientoDesdeApi = (api: MovimientoRemesaApi): MovimientoRemesa => ({
    id: api.id,
    fecha: fechaDesdeApi(api.fecha),
    tipo: api.tipo,
});

const reciboDeRemesaDesdeApi = (api: ReciboDeRemesaApi): ReciboDeRemesa => ({
    id: api.id,
    codigo: api.codigo,
    fechaVencimiento: fechaDesdeApi(api.fecha_vencimiento),
    estado: api.estado,
    situacion: api.situacion,
    importe: api.importe,
    clienteId: api.cliente_id,
    nombreCliente: api.nombre_cliente,
    pagos: (api.pagos ?? []).map(movimientoDesdeApi),
});

export const remesaDesdeApi = (api: RemesaApi): Remesa => ({
    id: api.id,
    fecha: fechaDesdeApi(api.fecha),
    fechaCargo: fechaDesdeApi(api.fecha_cargo),
    total: api.total,
    divisaId: api.divisa_id,
    cuentaId: api.cuenta_id,
    descripcionCuenta: api.descripcion_cuenta ?? "",
    estado: api.estado,
    empresaId: api.empresa_id,
    recibos: (api.recibos ?? []).map(reciboDeRemesaDesdeApi),
    pagos: (api.pagos ?? []).map(movimientoDesdeApi),
});

export const getRemesa: GetRemesa = async (id) => {
    return await RestAPI.getItem<Remesa, RemesaApi>(
        `${baseUrl}/${id}`,
        remesaDesdeApi,
        "Error al obtener la remesa de cobro"
    );
};

export const getRemesas: GetRemesas = async (criteria) => {
    return await RestAPI.getQuery<Remesa, RemesaApi>(
        baseUrl,
        criteria,
        remesaDesdeApi,
        "Error al obtener las remesas de cobro"
    );
};

export const postRemesa: PostRemesa = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        { cuenta_id: nueva.cuentaId, recibo_ids: nueva.reciboIds },
        "Error al crear la remesa de cobro"
    );

    return String(respuesta.id);
};

export const pagarRemesa: PagarRemesa = async (id, fecha) => {
    await RestAPI.post(
        `${baseUrl}/${id}/pagar`,
        { fecha },
        "Error al pagar la remesa de cobro"
    );
};

export const deshacerPagoRemesa: DeshacerPagoRemesa = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}/pago`,
        "Error al deshacer el pago de la remesa de cobro"
    );
};
