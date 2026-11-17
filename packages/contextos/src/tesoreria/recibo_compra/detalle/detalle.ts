import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { ReciboCompra } from "../diseño.js";
import { DevolucionRecibo } from "../../recibo_venta/detalle/devolver/diseño.js";
import { PagoRecibo } from "../../recibo_venta/detalle/pagar/diseño.js";
import { enDivisaExtranjeraCompra } from "../dominio.js";
import { CambiosRecibo, fechaApi } from "../../comun/recibo.ts";
import {
    getReciboCompra,
    patchAnularPagoReciboCompra,
    patchCambiarReciboCompra,
    patchDevolverReciboCompra,
    patchPagarReciboCompra,
} from "../infraestructura.js";
import { ContextoDetalleReciboCompra, EstadoDetalleReciboCompra } from "./diseño.js";

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
        nombreCuentaDomiciliacion: { tipo: "texto" },
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
    divisaId: '',
    divisaEmpresaId: null,
    pagos: [],
    cuentaDomiciliacionId: null,
    nombreCuentaDomiciliacion: '',
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

const recargarYPublicar: ProcesarDetalle = async (contexto) => {
    const recibo = await getReciboCompra(contexto.recibo.id);

    return [
        { ...contexto, estado: 'ABIERTO', recibo },
        [["recibo_cambiado", recibo]],
    ];
};

/** TES-02: pago manual; publica el recibo para que el maestro refresque su fila. */
export const pagarRecibo: ProcesarDetalle = async (contexto, payload) => {
    const pago = payload as PagoRecibo;
    await patchPagarReciboCompra(contexto.recibo.id, {
        cuentaPagoId: pago.cuenta_pago_id,
        fecha: pago.fecha.toISOString().slice(0, 10),
        ...(enDivisaExtranjeraCompra(contexto.recibo) && { tasaConversion: pago.tasa_conversion }),
    });
    return recargarYPublicar(contexto);
};

/** La cuenta es la del último pago; el modal la muestra sin dejar cambiarla. */
export const devolverRecibo: ProcesarDetalle = async (contexto, payload) => {
    const devolucion = payload as DevolucionRecibo;
    await patchDevolverReciboCompra(contexto.recibo.id, {
        cuentaPagoId: devolucion.cuenta_pago_id,
        fecha: devolucion.fecha.toISOString().slice(0, 10),
        ...(enDivisaExtranjeraCompra(contexto.recibo) && {
            tasaConversion: devolucion.tasa_conversion,
        }),
    });
    return recargarYPublicar(contexto);
};

export const anularUltimoPago: ProcesarDetalle = async (contexto) => {
    await patchAnularPagoReciboCompra(contexto.recibo.id);
    return recargarYPublicar(contexto);
};

/** TES-06: si baja el importe, el servidor crea otro recibo con la diferencia. */
export const cambiarRecibo: ProcesarDetalle = async (contexto, payload) => {
    const cambios = payload as CambiosRecibo;
    await patchCambiarReciboCompra(contexto.recibo.id, {
        fechaVencimiento: fechaApi(cambios.fecha_vencimiento),
        cuentaDomiciliacionId: cambios.cuenta_domiciliacion_id,
        ...(cambios.importe !== contexto.recibo.importe && { importe: cambios.importe }),
    });
    return recargarYPublicar(contexto);
};
