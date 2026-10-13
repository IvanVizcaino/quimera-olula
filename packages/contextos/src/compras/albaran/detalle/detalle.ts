import { facturarAlbaranes } from "#/compras/factura/infraestructura.ts";
import { CambioDivisa } from "#/ventas/comun/componentes/moleculas/CambiarDivisa/diseño.ts";
import { CambioProveedor } from "#/compras/comun/componentes/moleculas/CambioProveedor/diseño.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import {
    accionesListaEntidades,
    listaEntidadesInicial,
    ProcesarListaEntidades,
} from "@olula/lib/ListaEntidades.ts";
import { Albaran, LineaAlbaran } from "../diseño.ts";
import { albaranFacturado } from "../dominio.ts";
import {
    postBorrarMovimientoLoteCompra,
    postCrearMovimientoLoteCompra,
} from "#/almacen/albaran_compra/infraestructura.ts";
import { getAlbaran, getLineasAlbaran, patchAlbaran } from "../infraestructura.ts";
import { ContextoDetalleAlbaran, EstadoDetalleAlbaran } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleAlbaran, ContextoDetalleAlbaran>;

const pipeAlbaran = ejecutarListaProcesos<EstadoDetalleAlbaran, ContextoDetalleAlbaran>;

const conLineas = (fn: ProcesarListaEntidades<LineaAlbaran>) =>
    (ctx: ContextoDetalleAlbaran) => ({ ...ctx, lineas: fn(ctx.lineas) });

export const Lineas = accionesListaEntidades(conLineas);

const camposEditablesFacturado = [
    "fecha",
    "hora",
    "numeroProveedor",
    "almacenId",
    "formaPagoId",
    "observaciones",
];

export const metaAlbaran: MetaModelo<Albaran> = {
    campos: {
        codigo: { bloqueado: true },
        serieId: { bloqueado: true },
        numero: { bloqueado: true },
        ejercicioId: { bloqueado: true },
        nombreProveedor: { bloqueado: true },
        idFiscal: { bloqueado: true },
        fecha: { requerido: true, tipo: "fecha" },
        hora: { tipo: "hora" },
        numeroProveedor: {},
        divisaId: { bloqueado: true },
        tasaConversion: { tipo: "decimal", decimales: 6, bloqueado: true },
        observaciones: { tipo: "texto" },
        neto: { tipo: "moneda", bloqueado: true },
        totalIva: { tipo: "moneda", bloqueado: true },
        totalRecargo: { tipo: "moneda", bloqueado: true },
        totalIrpf: { tipo: "moneda", bloqueado: true },
        total: { tipo: "moneda", bloqueado: true },
        totalDivisaEmpresa: { tipo: "moneda", bloqueado: true },
        recargoFinanciero: { tipo: "moneda", bloqueado: true },
    },
    editable: (albaran: Albaran, campo?: string) =>
        !albaranFacturado(albaran) ||
        (campo !== undefined && camposEditablesFacturado.includes(campo)),
};

export const albaranVacio = (): Albaran => ({
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
    facturaId: null,
    pendienteFactura: true,
    observaciones: null,
});

export const contextoDetalleAlbaranInicial: ContextoDetalleAlbaran = {
    estado: 'INICIAL',
    albaran: albaranVacio(),
    facturaCreada: null,
    lineas: listaEntidadesInicial<LineaAlbaran>(),
};

export const refrescarAlbaran: ProcesarDetalle = async (contexto) => {
    const albaran = await getAlbaran(contexto.albaran.id);
    return [
        { ...contexto, albaran },
        [["albaran_cambiado", albaran]],
    ];
};

export const refrescarLineas: ProcesarDetalle = async (contexto) => {
    const lineas = await getLineasAlbaran(contexto.albaran.id);
    return Lineas.recargar(contexto, { datos: lineas, total: lineas.length });
};

export const guardarAlbaran = async (
    contexto: ContextoDetalleAlbaran,
    albaran: Albaran
): Promise<void> => {
    const campos: (keyof Albaran)[] = [
        "fecha",
        "hora",
        "numeroProveedor",
        "grupoIvaNegocioId",
        "formaPagoId",
        "almacenId",
        "observaciones",
    ];

    const cambios = Object.fromEntries(
        campos
            .filter((campo) => albaran[campo] !== contexto.albaran[campo])
            .map((campo) => [campo, albaran[campo]])
    );

    if (Object.keys(cambios).length === 0) return;

    await patchAlbaran(albaran.id, cambios);
};

export const facturarAlbaranProceso: ProcesarDetalle = async (contexto) => {
    const facturaCreada = await facturarAlbaranes([contexto.albaran.id]);
    const [refrescado, eventos] = await pipeAlbaran(contexto, [refrescarAlbaran]);
    return [{ ...refrescado, estado: 'FACTURA_CREADA', facturaCreada }, eventos];
};

export const cambiarDivisa: ProcesarDetalle = async (contexto, payload) => {
    const cambio = payload as CambioDivisa;
    await patchAlbaran(contexto.albaran.id, {
        divisaId: cambio.divisa_id,
        tasaConversion: cambio.tasa_conversion,
    });
    return pipeAlbaran(contexto, [refrescarAlbaran, 'ABIERTO']);
};

export const cambiarProveedor: ProcesarDetalle = async (contexto, payload) => {
    const cambio = payload as CambioProveedor;
    await patchAlbaran(contexto.albaran.id, {
        proveedorId: cambio.proveedorId || null,
        nombreProveedor: cambio.nombreProveedor,
        idFiscal: cambio.idFiscal,
    });
    return pipeAlbaran(contexto, [refrescarAlbaran, 'ABIERTO']);
};

const activarLineaPorId = (id: string) => async (contexto: ContextoDetalleAlbaran) => ({
    ...contexto,
    lineas: {
        ...contexto.lineas,
        activo: contexto.lineas.lista.find((l) => l.id === id) ?? null,
    },
});

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoDetalleAlbaran) => {
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
    return pipeAlbaran(contexto, [refrescarAlbaran, refrescarLineas, activarLineaPorId(id)]);
};

export const onLineaCambiada: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    return pipeAlbaran(contexto, [refrescarAlbaran, refrescarLineas, activarLineaPorId(id)]);
};

const reactivarLineaActiva: ProcesarDetalle = async (contexto) => {
    const id = contexto.lineas.activo?.id;
    if (!id) return contexto;
    return activarLineaPorId(id)(contexto);
};

export const crearMovimientoLote: ProcesarDetalle = async (contexto, payload) => {
    const { lote_id, cantidad } = payload as { lote_id: string; cantidad: number };
    const lineaId = contexto.lineas.activo!.id;
    await postCrearMovimientoLoteCompra(contexto.albaran.id, lineaId, { lote_id, cantidad });
    return pipeAlbaran(contexto, [refrescarAlbaran, refrescarLineas, reactivarLineaActiva]);
};

export const borrarMovimientoLote: ProcesarDetalle = async (contexto, payload) => {
    const { movimiento_id } = payload as { movimiento_id: string };
    const lineaId = contexto.lineas.activo!.id;
    await postBorrarMovimientoLoteCompra(contexto.albaran.id, lineaId, { movimiento_id });
    return pipeAlbaran(contexto, [refrescarAlbaran, refrescarLineas, reactivarLineaActiva]);
};

export const onLineaBorrada: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    const indice = contexto.lineas.lista.findIndex((l) => l.id === id);
    return pipeAlbaran(contexto, [
        refrescarAlbaran,
        refrescarLineas,
        activarLineaPorIndice(indice),
    ]);
};

const cargarAlbaran: (_: string) => ProcesarDetalle = (idAlbaran) => async (contexto) => {
    const [albaran, lineas] = await Promise.all([
        getAlbaran(idAlbaran),
        getLineasAlbaran(idAlbaran),
    ]);

    return pipeAlbaran(contexto, [
        async (ctx) => ({
            ...ctx,
            albaran,
            lineas: { lista: lineas, total: lineas.length, activo: lineas[0] ?? null },
        }),
        'ABIERTO',
    ]);
};

export const limpiarContexto: ProcesarDetalle = async (contexto) => ({
    ...contexto,
    estado: 'INICIAL',
    albaran: albaranVacio(),
    facturaCreada: null,
    lineas: listaEntidadesInicial<LineaAlbaran>(),
});

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idAlbaran = payload as string;
    if (idAlbaran) {
        return cargarAlbaran(idAlbaran)(contexto);
    }
    return limpiarContexto(contexto);
};
