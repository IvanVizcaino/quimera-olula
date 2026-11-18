import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { postPickingFijo } from "#/almacen/picking_fijo/infraestructura.ts";
import { ArticuloAbc, FilaPickingFijo, ClasesPicking, OrigenRotacion, PropuestaUbicacion, Recolocacion } from "./diseño.ts";
import {
    CLASES_PICKING_POR_DEFECTO, clasesPickingValidas, COBERTURA_POR_DEFECTO, DIAS_POR_DEFECTO,
    enteroPositivo, filaPickingDesdePropuesta, filasPickingACrear, LIMITE_PROPUESTA_POR_DEFECTO,
    LIMITE_RECOLOCACION_POR_DEFECTO, marcarTodasPicking, mensajeErrorApi, ORIGEN_POR_DEFECTO,
    origenRotacion, propuestaVacia, resumenCreacionPicking,
} from "./dominio.ts";
import { getAbc, getPropuesta, getPropuestaPicking, getRecolocacion } from "./infraestructura.ts";

export type EstadoSlotting = "INICIAL";

export type ContextoSlotting = {
    estado: EstadoSlotting;
    almacenId: string;
    origen: OrigenRotacion;
    diasAbc: string;
    abc: ArticuloAbc[] | null;
    articuloId: string;
    limitePropuesta: string;
    propuesta: PropuestaUbicacion | null;
    diasRecolocacion: string;
    limiteRecolocacion: string;
    recolocaciones: Recolocacion[] | null;
    diasPicking: string;
    clasesPicking: ClasesPicking;
    coberturaPicking: string;
    filasPicking: FilaPickingFijo[] | null;
    resumenPicking: string | null;
};

export const contextoSlottingInicial: ContextoSlotting = {
    estado: "INICIAL",
    almacenId: "",
    origen: ORIGEN_POR_DEFECTO,
    diasAbc: String(DIAS_POR_DEFECTO),
    abc: null,
    articuloId: "",
    limitePropuesta: String(LIMITE_PROPUESTA_POR_DEFECTO),
    propuesta: null,
    diasRecolocacion: String(DIAS_POR_DEFECTO),
    limiteRecolocacion: String(LIMITE_RECOLOCACION_POR_DEFECTO),
    recolocaciones: null,
    diasPicking: String(DIAS_POR_DEFECTO),
    clasesPicking: CLASES_PICKING_POR_DEFECTO,
    coberturaPicking: String(COBERTURA_POR_DEFECTO),
    filasPicking: null,
    resumenPicking: null,
};

type ProcesarSlotting = ProcesarContexto<EstadoSlotting, ContextoSlotting>;

const cambiarAlmacen: ProcesarSlotting = async (ctx, payload) => ({
    ...ctx,
    almacenId: (payload as string) ?? "",
    abc: null,
    propuesta: null,
    recolocaciones: null,
    filasPicking: null,
    resumenPicking: null,
});

const cambiarOrigen: ProcesarSlotting = async (ctx, payload) => ({
    ...ctx,
    origen: origenRotacion(payload as string),
    abc: null,
    propuesta: null,
    recolocaciones: null,
    filasPicking: null,
    resumenPicking: null,
});

const cambiarCampo = (campo: keyof ContextoSlotting): ProcesarSlotting => async (ctx, payload) => ({
    ...ctx,
    [campo]: (payload as string) ?? "",
});

const limpiarPicking = (ctx: ContextoSlotting): ContextoSlotting => ({ ...ctx, filasPicking: null, resumenPicking: null });

const cambiarParametroPicking = (campo: keyof ContextoSlotting): ProcesarSlotting => async (ctx, payload) =>
    limpiarPicking({ ...ctx, [campo]: (payload as string) ?? "" });

const cambiarClasesPicking: ProcesarSlotting = async (ctx, payload) =>
    limpiarPicking({ ...ctx, clasesPicking: clasesPickingValidas(payload as string) });

const proponerPicking: ProcesarSlotting = async (ctx) => {
    const propuesta = await getPropuestaPicking(
        ctx.almacenId,
        enteroPositivo(ctx.diasPicking, DIAS_POR_DEFECTO),
        ctx.origen,
        ctx.clasesPicking,
        enteroPositivo(ctx.coberturaPicking, COBERTURA_POR_DEFECTO)
    );
    return { ...ctx, filasPicking: propuesta.map(filaPickingDesdePropuesta), resumenPicking: null };
};

const actualizarFila = (
    ctx: ContextoSlotting, articuloId: string, cambios: Partial<FilaPickingFijo>
): ContextoSlotting => ({
    ...ctx,
    filasPicking: (ctx.filasPicking ?? []).map((f) => (f.articuloId === articuloId ? { ...f, ...cambios } : f)),
});

const cambiarFilaPicking: ProcesarSlotting = async (ctx, payload) => {
    const { articuloId, cambios } = payload as { articuloId: string; cambios: Partial<FilaPickingFijo> };
    return actualizarFila(ctx, articuloId, cambios);
};

const crearPickingFijos: ProcesarSlotting = async (ctx) => {
    const filas = ctx.filasPicking ?? [];
    const aCrear = filasPickingACrear(filas);
    const resultado = new Map<string, Partial<FilaPickingFijo>>();
    for (const f of aCrear) {
        try {
            await postPickingFijo({
                articuloId: f.articuloId,
                ubicacionId: f.ubicacionId as string,
                minimo: f.minimo,
                maximo: f.maximo,
                unidadReposicion: f.unidadReposicion,
            });
            resultado.set(f.articuloId, { estado: "CREADO", errorCreacion: null, seleccionada: false });
        } catch (e) {
            resultado.set(f.articuloId, { estado: "ERROR", errorCreacion: mensajeErrorApi(e) });
        }
    }
    const nuevas = filas.map((f) => ({ ...f, ...resultado.get(f.articuloId) }));
    return { ...ctx, filasPicking: nuevas, resumenPicking: resumenCreacionPicking(nuevas, aCrear.length) };
};

const calcularAbc: ProcesarSlotting = async (ctx) => {
    const abc = await getAbc(ctx.almacenId, enteroPositivo(ctx.diasAbc, DIAS_POR_DEFECTO), ctx.origen);
    return { ...ctx, abc };
};

const proponer: ProcesarSlotting = async (ctx) => {
    const propuesta = await getPropuesta(
        ctx.almacenId, ctx.articuloId, enteroPositivo(ctx.limitePropuesta, LIMITE_PROPUESTA_POR_DEFECTO),
        ctx.origen
    );
    return { ...ctx, propuesta: propuesta ?? propuestaVacia };
};

const calcularRecolocacion: ProcesarSlotting = async (ctx) => {
    const recolocaciones = await getRecolocacion(
        ctx.almacenId,
        enteroPositivo(ctx.diasRecolocacion, DIAS_POR_DEFECTO),
        enteroPositivo(ctx.limiteRecolocacion, LIMITE_RECOLOCACION_POR_DEFECTO),
        ctx.origen
    );
    return { ...ctx, recolocaciones };
};

export const getMaquina: () => Maquina<EstadoSlotting, ContextoSlotting> = () => ({
    INICIAL: {
        almacen_cambiado: cambiarAlmacen,
        origen_cambiado: cambiarOrigen,
        dias_abc_cambiados: cambiarCampo("diasAbc"),
        abc_solicitado: calcularAbc,
        articulo_cambiado: async (ctx, payload) => ({ ...ctx, articuloId: (payload as string) ?? "", propuesta: null }),
        limite_propuesta_cambiado: cambiarCampo("limitePropuesta"),
        propuesta_solicitada: proponer,
        dias_recolocacion_cambiados: cambiarCampo("diasRecolocacion"),
        limite_recolocacion_cambiado: cambiarCampo("limiteRecolocacion"),
        recolocacion_solicitada: calcularRecolocacion,
        dias_picking_cambiados: cambiarParametroPicking("diasPicking"),
        clases_picking_cambiadas: cambiarClasesPicking,
        cobertura_picking_cambiada: cambiarParametroPicking("coberturaPicking"),
        picking_solicitado: proponerPicking,
        fila_picking_cambiada: cambiarFilaPicking,
        seleccion_picking_cambiada: async (ctx, payload) => ({
            ...ctx, filasPicking: marcarTodasPicking(ctx.filasPicking ?? [], Boolean(payload)),
        }),
        picking_fijo_creacion_solicitada: crearPickingFijos,
    },
});
