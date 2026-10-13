import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { ReciboCompra } from "../diseño.js";
import { getReciboCompra, patchAnularPagoReciboCompra, patchDevolverReciboCompra, patchPagarReciboCompra } from "../infraestructura.js";
import { ContextoDetalleReciboCompra, EstadoDetalleReciboCompra } from "./diseño.js";
import { DevolucionReciboCompra } from "./devolver/diseño.js";
import { PagoReciboCompra } from "./pagar/diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleReciboCompra, ContextoDetalleReciboCompra>;

const pipeRecibo = ejecutarListaProcesos<EstadoDetalleReciboCompra, ContextoDetalleReciboCompra>;

export const metaReciboCompra: MetaModelo<ReciboCompra> = {
    campos: {
        codigo: { tipo: "texto" },
        estado: { tipo: "texto" },
        importe: { tipo: "moneda" },
        fechaEmision: { tipo: "fecha" },
        fechaVencimiento: { tipo: "fecha" },
        nombreProveedor: { tipo: "texto" },
        idFiscal: { tipo: "texto" },
        facturaId: { tipo: "texto" },
    },
    editable: () => false,
};

export const reciboCompraInicial = (): ReciboCompra => ({
    id: '',
    facturaId: null,
    codigo: '',
    fechaEmision: null,
    fechaVencimiento: null,
    estado: '',
    importe: 0,
    proveedorId: null,
    nombreProveedor: '',
    idFiscal: '',
    pagos: [],
});

export const contextoDetalleReciboCompraInicial: ContextoDetalleReciboCompra = {
    estado: 'INICIAL',
    recibo: reciboCompraInicial(),
};

export const cargarReciboCompra: (_: string) => ProcesarDetalle =
    (idRecibo) => async (contexto) => {
        const recibo = await getReciboCompra(idRecibo);
        return pipeRecibo(contexto, [
            async (ctx) => ({ ...ctx, recibo }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idRecibo = payload as string;
    if (idRecibo) {
        return cargarReciboCompra(idRecibo)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', recibo: reciboCompraInicial() };
};

/** Registra el pago manual del recibo y lo recarga. */
export const pagarRecibo: ProcesarDetalle = async (contexto, payload) => {
    const pago = payload as PagoReciboCompra;
    await patchPagarReciboCompra(contexto.recibo.id, {
        cuentaPagoId: pago.cuenta_pago_id,
        fecha: pago.fecha.toISOString().slice(0, 10),
        iban: pago.iban || null,
        numeroCheque: pago.numero_cheque || null,
    });
    const recibo = await getReciboCompra(contexto.recibo.id);

    return [
        { ...contexto, estado: 'ABIERTO', recibo },
        [["recibo_cambiado", recibo]],
    ];
};

/** Devuelve el recibo pagado y lo recarga. */
export const devolverRecibo: ProcesarDetalle = async (contexto, payload) => {
    const devolucion = payload as DevolucionReciboCompra;
    await patchDevolverReciboCompra(contexto.recibo.id, {
        cuentaPagoId: devolucion.cuenta_pago_id,
        fecha: devolucion.fecha.toISOString().slice(0, 10),
        iban: devolucion.iban || null,
        numeroCheque: devolucion.numero_cheque || null,
    });
    const recibo = await getReciboCompra(contexto.recibo.id);

    return [
        { ...contexto, estado: 'ABIERTO', recibo },
        [["recibo_cambiado", recibo]],
    ];
};

/** Anula el pago indicado por pago_id y recarga el recibo. */
export const anularPagoRecibo: ProcesarDetalle = async (contexto, payload) => {
    const pagoId = payload as string;
    await patchAnularPagoReciboCompra(contexto.recibo.id, pagoId);
    const recibo = await getReciboCompra(contexto.recibo.id);

    return [
        { ...contexto, estado: 'ABIERTO', recibo },
        [["recibo_cambiado", recibo]],
    ];
};
