import { CambioDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/diseño.ts";
import { CambioProveedor } from "#/compras/comun/componentes/moleculas/CambioProveedor/diseño.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import {
    accionesListaEntidades,
    listaEntidadesInicial,
    ProcesarListaEntidades,
} from "@olula/lib/ListaEntidades.ts";
import { Factura, LineaFactura } from "../diseño.ts";
import { facturaEditable } from "../dominio.ts";
import {
    getFactura,
    getLineasFactura,
    patchFactura,
    patchRectificativa,
    patchRegistrarFactura,
} from "../infraestructura.ts";
import { ContextoDetalleFactura, EstadoDetalleFactura } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleFactura, ContextoDetalleFactura>;

const pipeFactura = ejecutarListaProcesos<EstadoDetalleFactura, ContextoDetalleFactura>;

const conLineas = (fn: ProcesarListaEntidades<LineaFactura>) =>
    (ctx: ContextoDetalleFactura) => ({ ...ctx, lineas: fn(ctx.lineas) });

export const Lineas = accionesListaEntidades(conLineas);

const camposEditablesCerrada = [
    "fecha",
    "hora",
    "numeroProveedor",
    "almacenId",
    "formaPagoId",
    "observaciones",
    "deAbono",
    "servicios",
    "noGenerarAsiento",
];

export const metaFactura: MetaModelo<Factura> = {
    campos: {
        codigo: { bloqueado: true },
        serieId: { bloqueado: true },
        numero: { bloqueado: true },
        ejercicioId: { bloqueado: true },
        nombreProveedor: { bloqueado: true },
        idFiscal: { bloqueado: true },
        codigoRectificativa: { bloqueado: true },
        fecha: { requerido: true, tipo: "fecha" },
        hora: { tipo: "hora" },
        numeroProveedor: {},
        divisaId: { bloqueado: true },
        tasaConversion: { tipo: "decimal", decimales: 6, bloqueado: true },
        observaciones: { tipo: "texto" },
        deAbono: { tipo: "checkbox" },
        servicios: { tipo: "checkbox" },
        noGenerarAsiento: { tipo: "checkbox" },
        neto: { tipo: "moneda", bloqueado: true },
        totalIva: { tipo: "moneda", bloqueado: true },
        totalRecargo: { tipo: "moneda", bloqueado: true },
        totalIrpf: { tipo: "moneda", bloqueado: true },
        total: { tipo: "moneda", bloqueado: true },
        totalDivisaEmpresa: { tipo: "moneda", bloqueado: true },
        recargoFinanciero: { tipo: "moneda", bloqueado: true },
    },
    editable: (factura: Factura, campo?: string) =>
        facturaEditable(factura) ||
        (campo !== undefined && camposEditablesCerrada.includes(campo)),
};

export const facturaVacia = (): Factura => ({
    id: '',
    codigo: '',
    ejercicioId: '',
    serieId: '',
    numero: '',
    fecha: new Date(),
    hora: '',
    numeroProveedor: null,
    proveedorId: null,
    nombreProveedor: '',
    idFiscal: '',
    almacenId: null,
    nombreAlmacen: null,
    formaPagoId: null,
    nombreFormaPago: null,
    grupoIvaNegocioId: '',
    divisaId: '',
    tasaConversion: 1,
    neto: 0,
    totalIva: 0,
    totalRecargo: 0,
    totalIrpf: 0,
    total: 0,
    totalDivisaEmpresa: 0,
    recargoFinanciero: 0,
    rectificativaId: null,
    codigoRectificativa: null,
    deAbono: false,
    automatica: false,
    editable: true,
    servicios: false,
    noGenerarAsiento: false,
    asientoId: null,
    observaciones: null,
    estadoExpedicion: '',
});

export const contextoDetalleFacturaInicial: ContextoDetalleFactura = {
    estado: 'INICIAL',
    factura: facturaVacia(),
    lineas: listaEntidadesInicial<LineaFactura>(),
};

export const refrescarFactura: ProcesarDetalle = async (contexto) => {
    const factura = await getFactura(contexto.factura.id);
    return [
        { ...contexto, factura },
        [["factura_cambiada", factura]],
    ];
};

export const refrescarLineas: ProcesarDetalle = async (contexto) => {
    const lineas = await getLineasFactura(contexto.factura.id);
    return Lineas.recargar(contexto, { datos: lineas, total: lineas.length });
};

export const guardarFactura = async (
    contexto: ContextoDetalleFactura,
    factura: Factura
): Promise<void> => {
    const campos: (keyof Factura)[] = [
        "fecha",
        "hora",
        "numeroProveedor",
        "grupoIvaNegocioId",
        "formaPagoId",
        "almacenId",
        "observaciones",
        "deAbono",
        "servicios",
        "noGenerarAsiento",
    ];

    const cambios = Object.fromEntries(
        campos
            .filter((campo) => factura[campo] !== contexto.factura[campo])
            .map((campo) => [campo, factura[campo]])
    );

    if (Object.keys(cambios).length === 0) return;

    await patchFactura(factura.id, cambios);
};

/**
 * El servidor calcula el código definitivo, así que hay que releer la factura
 * para verlo: la respuesta solo confirma.
 */
export const registrarFacturaProceso: ProcesarDetalle = async (contexto) => {
    await patchRegistrarFactura(contexto.factura.id);
    return pipeFactura(contexto, [refrescarFactura, "ABIERTO"]);
};

export const cambiarRectificativa: ProcesarDetalle = async (contexto, payload) => {
    const rectificativaId = (payload as string | null) || null;
    await patchRectificativa(contexto.factura.id, rectificativaId);
    return pipeFactura(contexto, [refrescarFactura, 'ABIERTO']);
};

export const cambiarDivisa: ProcesarDetalle = async (contexto, payload) => {
    const cambio = payload as CambioDivisa;
    await patchFactura(contexto.factura.id, {
        divisaId: cambio.divisa_id,
        tasaConversion: cambio.tasa_conversion,
    });
    return pipeFactura(contexto, [refrescarFactura, 'ABIERTO']);
};

export const cambiarProveedor: ProcesarDetalle = async (contexto, payload) => {
    const cambio = payload as CambioProveedor;
    await patchFactura(contexto.factura.id, {
        proveedorId: cambio.proveedorId || null,
        nombreProveedor: cambio.nombreProveedor,
        idFiscal: cambio.idFiscal,
    });
    return pipeFactura(contexto, [refrescarFactura, 'ABIERTO']);
};

const activarLineaPorId = (id: string) => async (contexto: ContextoDetalleFactura) => ({
    ...contexto,
    lineas: {
        ...contexto.lineas,
        activo: contexto.lineas.lista.find((l) => l.id === id) ?? null,
    },
});

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoDetalleFactura) => {
    const lineas = contexto.lineas.lista;
    return {
        ...contexto,
        lineas: {
            ...contexto.lineas,
            activo:
                lineas.length > 0
                    ? indice >= 0 && indice < lineas.length
                        ? lineas[indice]
                        : lineas[lineas.length - 1]
                    : null,
        },
    };
};

export const onLineaCreada: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    return pipeFactura(contexto, [refrescarFactura, refrescarLineas, activarLineaPorId(id)]);
};

export const onLineaCambiada: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    return pipeFactura(contexto, [refrescarFactura, refrescarLineas, activarLineaPorId(id)]);
};

export const onLineaBorrada: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    const indice = contexto.lineas.lista.findIndex((l) => l.id === id);
    return pipeFactura(contexto, [
        refrescarFactura,
        refrescarLineas,
        activarLineaPorIndice(indice),
    ]);
};

const cargarFactura: (_: string) => ProcesarDetalle = (idFactura) => async (contexto) => {
    const [factura, lineas] = await Promise.all([
        getFactura(idFactura),
        getLineasFactura(idFactura),
    ]);

    return pipeFactura(contexto, [
        async (ctx) => ({
            ...ctx,
            factura,
            lineas: { lista: lineas, total: lineas.length, activo: lineas[0] ?? null },
        }),
        'ABIERTO',
    ]);
};

export const limpiarContexto: ProcesarDetalle = async (contexto) => ({
    ...contexto,
    estado: 'INICIAL',
    factura: facturaVacia(),
    lineas: listaEntidadesInicial<LineaFactura>(),
});

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idFactura = payload as string;
    if (idFactura) {
        return cargarFactura(idFactura)(contexto);
    }
    return limpiarContexto(contexto);
};
