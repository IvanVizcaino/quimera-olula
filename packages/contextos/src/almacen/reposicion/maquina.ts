import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { Reposicion } from "./diseño.ts";
import { reposicionVacia } from "./dominio.ts";
import { generarReposicion } from "./infraestructura.ts";

export type EstadoReposicion = "INICIAL" | "CALCULADO" | "GENERADO";

export type ContextoReposicion = {
    estado: EstadoReposicion;
    almacenId: string;
    reposicion: Reposicion;
};

export const contextoReposicionInicial: ContextoReposicion = {
    estado: "INICIAL",
    almacenId: "",
    reposicion: reposicionVacia,
};

type ProcesarReposicion = ProcesarContexto<EstadoReposicion, ContextoReposicion>;

const cambiarAlmacen: ProcesarReposicion = async (ctx, payload) => ({
    ...ctx,
    estado: "INICIAL",
    almacenId: (payload as string) ?? "",
    reposicion: reposicionVacia,
});

const calcular: ProcesarReposicion = async (ctx) => {
    const reposicion = await generarReposicion(ctx.almacenId, true);
    return { ...ctx, estado: "CALCULADO", reposicion };
};

const generar: ProcesarReposicion = async (ctx) => {
    const reposicion = await generarReposicion(ctx.almacenId, false);
    return { ...ctx, estado: "GENERADO", reposicion };
};

export const getMaquina: () => Maquina<EstadoReposicion, ContextoReposicion> = () => ({
    INICIAL: {
        almacen_cambiado: cambiarAlmacen,
        calculo_solicitado: calcular,
    },
    CALCULADO: {
        almacen_cambiado: cambiarAlmacen,
        calculo_solicitado: calcular,
        generacion_solicitada: generar,
    },
    GENERADO: {
        almacen_cambiado: cambiarAlmacen,
        calculo_solicitado: calcular,
    },
});
