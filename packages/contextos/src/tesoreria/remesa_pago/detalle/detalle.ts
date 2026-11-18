import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { RemesaPago } from "../diseño.js";
import { fechaIso } from "../dominio.js";
import { deshacerPagoRemesaPago, getRemesaPago, pagarRemesaPago } from "../infraestructura.js";
import { ContextoDetalleRemesaPago, EstadoDetalleRemesaPago } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleRemesaPago, ContextoDetalleRemesaPago>;

const pipeRemesa = ejecutarListaProcesos<EstadoDetalleRemesaPago, ContextoDetalleRemesaPago>;

export const metaRemesaPago: MetaModelo<RemesaPago> = {
    campos: {
        tipo: { tipo: "texto" },
        fecha: { tipo: "fecha" },
        fechaPago: { tipo: "fecha" },
        estado: { tipo: "texto" },
        cuentaId: { tipo: "texto" },
        descripcionCuenta: { tipo: "texto" },
        divisaId: { tipo: "texto" },
        empresaId: { tipo: "texto" },
        total: { tipo: "moneda" },
    },
    editable: () => false,
};

export const remesaPagoInicial = (): RemesaPago => ({
    id: '',
    tipo: 'Recibos',
    fecha: null,
    fechaPago: null,
    total: 0,
    divisaId: '',
    cuentaId: '',
    descripcionCuenta: '',
    estado: '',
    empresaId: '',
    recibos: [],
    nominas: [],
    pagos: [],
});

export const contextoDetalleRemesaPagoInicial: ContextoDetalleRemesaPago = {
    estado: 'INICIAL',
    remesa: remesaPagoInicial(),
};

export const cargarRemesaPago: (_: string) => ProcesarDetalle =
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
        return cargarRemesaPago(idRemesa)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', remesa: remesaPagoInicial() };
};

export const refrescarRemesaPago: ProcesarDetalle = async (contexto) => {
    const remesa = await getRemesaPago(contexto.remesa.id);

    return [
        { ...contexto, estado: 'ABIERTO', remesa },
        [["remesa_cambiada", remesa]],
    ];
};

export const pagarRemesaProceso: ProcesarDetalle = async (contexto, payload) => {
    const fecha = payload as Date;
    await pagarRemesaPago(contexto.remesa.id, fechaIso(fecha));

    return refrescarRemesaPago(contexto);
};

export const deshacerPagoProceso: ProcesarDetalle = async (contexto) => {
    await deshacerPagoRemesaPago(contexto.remesa.id);

    return refrescarRemesaPago(contexto);
};
