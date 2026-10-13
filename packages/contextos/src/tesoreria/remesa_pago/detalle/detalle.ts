import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { RemesaPago } from "../diseño.js";
import {
    deshacerPagoRemesaPago,
    getRemesaPago,
    pagarRemesaPago,
    patchAsociarRecibosRemesaPago,
    patchExcluirReciboRemesaPago,
} from "../infraestructura.js";
import { ContextoDetalleRemesaPago, EstadoDetalleRemesaPago } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleRemesaPago, ContextoDetalleRemesaPago>;

const pipeRemesa = ejecutarListaProcesos<EstadoDetalleRemesaPago, ContextoDetalleRemesaPago>;

export const metaRemesaPago: MetaModelo<RemesaPago> = {
    campos: {
        fecha: { tipo: "fecha" },
        fechaCargo: { tipo: "fecha" },
        estado: { tipo: "texto" },
        cuentaId: { tipo: "texto" },
        divisaId: { tipo: "texto" },
        empresaId: { tipo: "texto" },
        total: { tipo: "moneda" },
    },
    editable: () => false,
};

export const remesaPagoInicial = (): RemesaPago => ({
    id: '',
    fecha: null,
    fechaCargo: null,
    total: 0,
    divisaId: '',
    cuentaId: '',
    estado: '',
    empresaId: '',
    recibos: [],
    pagos: [],
});

export const contextoDetalleRemesaPagoInicial: ContextoDetalleRemesaPago = {
    estado: 'INICIAL',
    remesa: remesaPagoInicial(),
    reciboExcluirId: null,
};

export const cargarRemesa: (_: string) => ProcesarDetalle =
    (idRemesa) => async (contexto) => {
        const remesa = await getRemesaPago(idRemesa);
        return pipeRemesa(contexto, [
            async (ctx) => ({ ...ctx, remesa }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idRemesa = payload as string;
    if (idRemesa) {
        return cargarRemesa(idRemesa)(contexto);
    }
    return {
        ...contexto,
        estado: 'INICIAL',
        remesa: remesaPagoInicial(),
        reciboExcluirId: null,
    };
};

export const refrescarRemesa: ProcesarDetalle = async (contexto) => {
    const remesa = await getRemesaPago(contexto.remesa.id);

    return [
        { ...contexto, estado: 'ABIERTO', remesa },
        [["remesa_cambiada", remesa]],
    ];
};

export const pagarRemesaPagoProceso: ProcesarDetalle = async (contexto, payload) => {
    const pago = payload as { fecha: Date; iban?: string; numero_cheque?: string };
    await pagarRemesaPago(contexto.remesa.id, {
        fecha: pago.fecha.toISOString().slice(0, 10),
        iban: pago.iban || null,
        numeroCheque: pago.numero_cheque || null,
    });

    return refrescarRemesa(contexto);
};

export const deshacerPagoProceso: ProcesarDetalle = async (contexto) => {
    await deshacerPagoRemesaPago(contexto.remesa.id);

    return refrescarRemesa(contexto);
};

export const asociarRecibosProceso: ProcesarDetalle = async (contexto, payload) => {
    const reciboIds = payload as string[];
    await patchAsociarRecibosRemesaPago(contexto.remesa.id, reciboIds);

    const ctxRefrescado = await refrescarRemesa(contexto);
    const ctx = Array.isArray(ctxRefrescado) ? ctxRefrescado[0] : ctxRefrescado;

    return { ...ctx, reciboExcluirId: null };
};

export const excluirReciboProceso: ProcesarDetalle = async (contexto) => {
    const reciboId = contexto.reciboExcluirId;
    if (!reciboId) return { ...contexto, estado: 'ABIERTO' };

    await patchExcluirReciboRemesaPago(contexto.remesa.id, reciboId);

    const ctxRefrescado = await refrescarRemesa(contexto);
    const ctx = Array.isArray(ctxRefrescado) ? ctxRefrescado[0] : ctxRefrescado;

    return { ...ctx, reciboExcluirId: null };
};

export const solicitarExcluirRecibo: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    estado: 'EXCLUYENDO_RECIBO',
    reciboExcluirId: payload as string,
});

export const cancelarExcluirRecibo: ProcesarDetalle = async (contexto) => ({
    ...contexto,
    estado: 'ABIERTO',
    reciboExcluirId: null,
});
