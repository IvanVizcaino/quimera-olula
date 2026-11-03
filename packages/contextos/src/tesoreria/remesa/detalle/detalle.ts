import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { Remesa } from "../diseño.js";
import { deshacerPagoRemesa, getRemesa, pagarRemesa } from "../infraestructura.js";
import { ContextoDetalleRemesa, EstadoDetalleRemesa } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleRemesa, ContextoDetalleRemesa>;

const pipeRemesa = ejecutarListaProcesos<EstadoDetalleRemesa, ContextoDetalleRemesa>;

export const metaRemesa: MetaModelo<Remesa> = {
    campos: {
        fecha: { tipo: "fecha" },
        fechaCargo: { tipo: "fecha" },
        estado: { tipo: "texto" },
        cuentaId: { tipo: "texto" },
        descripcionCuenta: { tipo: "texto" },
        divisaId: { tipo: "texto" },
        empresaId: { tipo: "texto" },
        total: { tipo: "moneda" },
    },
    editable: () => false,
};

export const remesaInicial = (): Remesa => ({
    id: '',
    fecha: null,
    fechaCargo: null,
    total: 0,
    divisaId: '',
    cuentaId: '',
    descripcionCuenta: '',
    estado: '',
    empresaId: '',
    recibos: [],
    pagos: [],
});

export const contextoDetalleRemesaInicial: ContextoDetalleRemesa = {
    estado: 'INICIAL',
    remesa: remesaInicial(),
};

export const cargarRemesa: (_: string) => ProcesarDetalle =
    (idRemesa) => async (contexto) => {
        const remesa = await getRemesa(idRemesa);
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
    return { ...contexto, estado: 'INICIAL', remesa: remesaInicial() };
};

export const refrescarRemesa: ProcesarDetalle = async (contexto) => {
    const remesa = await getRemesa(contexto.remesa.id);

    return [
        { ...contexto, estado: 'ABIERTO', remesa },
        [["remesa_cambiada", remesa]],
    ];
};

export const pagarRemesaProceso: ProcesarDetalle = async (contexto, payload) => {
    const fecha = payload as Date;
    await pagarRemesa(contexto.remesa.id, fecha.toISOString().slice(0, 10));

    return refrescarRemesa(contexto);
};

export const deshacerPagoProceso: ProcesarDetalle = async (contexto) => {
    await deshacerPagoRemesa(contexto.remesa.id);

    return refrescarRemesa(contexto);
};
