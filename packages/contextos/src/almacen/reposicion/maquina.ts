import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { Reposicion } from "./diseño.ts";
import { marcarNecesidad, reposicionVacia, seleccionInicial } from "./dominio.ts";
import { generarReposicion } from "./infraestructura.ts";

export type EstadoReposicion = "INICIAL" | "CALCULADO" | "GENERADO";

export type ContextoReposicion = {
    estado: EstadoReposicion;
    almacenId: string;
    reposicion: Reposicion;
    /** Picking fijos marcados para generar el traspaso. */
    seleccion: string[];
};

export const contextoReposicionInicial: ContextoReposicion = {
    estado: "INICIAL",
    almacenId: "",
    reposicion: reposicionVacia,
    seleccion: [],
};

type ProcesarReposicion = ProcesarContexto<EstadoReposicion, ContextoReposicion>;

const cambiarAlmacen: ProcesarReposicion = async (ctx, payload) => ({
    ...ctx,
    estado: "INICIAL",
    almacenId: (payload as string) ?? "",
    reposicion: reposicionVacia,
    seleccion: [],
});

const calcular: ProcesarReposicion = async (ctx) => {
    const reposicion = await generarReposicion(ctx.almacenId, true);
    return { ...ctx, estado: "CALCULADO", reposicion, seleccion: seleccionInicial(reposicion) };
};

const generar: ProcesarReposicion = async (ctx) => {
    const reposicion = await generarReposicion(ctx.almacenId, false, ctx.seleccion);
    return { ...ctx, estado: "GENERADO", reposicion };
};

const cambiarMarca: ProcesarReposicion = async (ctx, payload) => {
    const { id, marcada } = payload as { id: string; marcada: boolean };
    return { ...ctx, seleccion: marcarNecesidad(ctx.seleccion, id, marcada) };
};

const marcarTodas: ProcesarReposicion = async (ctx, payload) => ({
    ...ctx,
    seleccion: payload ? seleccionInicial(ctx.reposicion) : [],
});

export const getMaquina: () => Maquina<EstadoReposicion, ContextoReposicion> = () => ({
    INICIAL: {
        almacen_cambiado: cambiarAlmacen,
        calculo_solicitado: calcular,
    },
    CALCULADO: {
        almacen_cambiado: cambiarAlmacen,
        calculo_solicitado: calcular,
        generacion_solicitada: generar,
        necesidad_marcada: cambiarMarca,
        seleccion_todas_cambiada: marcarTodas,
    },
    GENERADO: {
        almacen_cambiado: cambiarAlmacen,
        calculo_solicitado: calcular,
    },
});
