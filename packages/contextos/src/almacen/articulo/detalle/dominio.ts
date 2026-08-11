import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo, publicar, stringNoVacio } from "@olula/lib/dominio.js";
import { Articulo } from "../diseño.ts";
import { getArticulo, patchArticulo } from "../infraestructura.ts";
import { ContextoArticulo, EstadoArticulo } from "./diseño.ts";

type ProcesarArticulo = ProcesarContexto<EstadoArticulo, ContextoArticulo>;

const pipeArticulo = ejecutarListaProcesos<EstadoArticulo, ContextoArticulo>;

export const articuloVacio = (): Articulo => ({
    id: "",
    descripcion: "",
});

export const metaArticulo: MetaModelo<Articulo> = {
    campos: {
        descripcion: {
            requerido: true,
            validacion: (m: Articulo) => stringNoVacio(m.descripcion),
        },
    },
};

export const getContextoVacio: ProcesarArticulo = async (ctx) => ({
    ...ctx,
    estado: "INICIAL",
    articulo: articuloVacio(),
    articuloInicial: articuloVacio(),
});

const cargarArticulo = (id: string): ProcesarArticulo =>
    async (ctx) => {
        const articulo = await getArticulo(id);
        return { ...ctx, articulo, articuloInicial: articulo };
    };

const abiertoContexto: ProcesarArticulo = async (ctx) => ({
    ...ctx,
    estado: "ABIERTO",
});

export const cargarContexto: ProcesarArticulo = async (ctx, payload) => {
    const id = payload as string;
    if (id) {
        return pipeArticulo(ctx, [cargarArticulo(id), abiertoContexto]);
    }
    return getContextoVacio(ctx);
};

export const guardarArticulo: ProcesarArticulo = async (ctx, payload) => {
    const articulo = payload as Articulo;
    await patchArticulo(ctx.articulo.id, articulo);
    const actualizado = await getArticulo(ctx.articulo.id);

    return pipeArticulo(
        { ...ctx, articulo: actualizado, articuloInicial: actualizado },
        [publicar("articulo_cambiado", actualizado), "ABIERTO"]
    );
};

export const cancelarCambioArticulo: ProcesarArticulo = async (ctx) => ({
    ...ctx,
    articulo: ctx.articuloInicial,
});

export const borrarArticulo: ProcesarArticulo = async (ctx, payload) => {
    const { articuloId } = (payload as { articuloId: string }) ?? {
        articuloId: ctx.articulo.id,
    };

    return pipeArticulo(ctx, [
        getContextoVacio,
        publicar("articulo_borrado", articuloId),
    ]);
};
