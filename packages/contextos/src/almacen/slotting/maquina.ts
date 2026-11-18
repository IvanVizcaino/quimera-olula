import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { ArticuloAbc, OrigenRotacion, PropuestaUbicacion, Recolocacion } from "./diseño.ts";
import {
    DIAS_POR_DEFECTO, enteroPositivo, ORIGEN_POR_DEFECTO, origenRotacion, LIMITE_PROPUESTA_POR_DEFECTO, LIMITE_RECOLOCACION_POR_DEFECTO, propuestaVacia,
} from "./dominio.ts";
import { getAbc, getPropuesta, getRecolocacion } from "./infraestructura.ts";

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
};

type ProcesarSlotting = ProcesarContexto<EstadoSlotting, ContextoSlotting>;

const cambiarAlmacen: ProcesarSlotting = async (ctx, payload) => ({
    ...ctx,
    almacenId: (payload as string) ?? "",
    abc: null,
    propuesta: null,
    recolocaciones: null,
});

const cambiarOrigen: ProcesarSlotting = async (ctx, payload) => ({
    ...ctx,
    origen: origenRotacion(payload as string),
    abc: null,
    propuesta: null,
    recolocaciones: null,
});

const cambiarCampo = (campo: keyof ContextoSlotting): ProcesarSlotting => async (ctx, payload) => ({
    ...ctx,
    [campo]: (payload as string) ?? "",
});

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
    },
});
