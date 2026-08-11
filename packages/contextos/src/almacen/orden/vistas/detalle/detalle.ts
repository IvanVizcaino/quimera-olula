import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import {
    accionesListaEntidades,
    listaEntidadesInicial,
    ProcesarListaEntidades,
} from "@olula/lib/ListaEntidades.js";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import { ordenVacia } from "../../dominio.ts";
import { getOrden, patchOrden } from "../../infraestructura.ts";
import { ContextoOrdenAlmacen, EstadoOrdenAlmacen } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoOrdenAlmacen, ContextoOrdenAlmacen>;

const pipeOrden = ejecutarListaProcesos<EstadoOrdenAlmacen, ContextoOrdenAlmacen>;

const conLineas = (fn: ProcesarListaEntidades<LineaOrdenAlmacen>) =>
    (ctx: ContextoOrdenAlmacen) => ({ ...ctx, lineas: fn(ctx.lineas) });

export const Lineas = accionesListaEntidades(conLineas);

export const refrescarOrden: ProcesarDetalle = async (contexto) => {
    const orden = await getOrden(contexto.orden.id);
    return [
        {
            ...contexto,
            orden,
            lineas: {
                ...contexto.lineas,
                lista: orden.lineas,
                total: orden.lineas.length,
            },
        },
        [["orden_cambiada", orden]],
    ];
};

export const guardarOrden = async (
    contexto: ContextoOrdenAlmacen,
    orden: OrdenAlmacen
): Promise<void> => {
    if (
        orden.idCajaOrigen !== contexto.orden.idCajaOrigen ||
        orden.idUbicacionOrigen !== contexto.orden.idUbicacionOrigen ||
        orden.idCajaDestino !== contexto.orden.idCajaDestino ||
        orden.idUbicacionDestino !== contexto.orden.idUbicacionDestino ||
        orden.descripcion !== contexto.orden.descripcion
    ) {
        await patchOrden(orden.id, orden);
    }
};

const activarLineaPorId = (id: string) => async (contexto: ContextoOrdenAlmacen) => {
    const lineaActiva = contexto.lineas.lista.find((l) => l.id === id) ?? null;
    return {
        ...contexto,
        lineas: { ...contexto.lineas, activo: lineaActiva },
    };
};

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoOrdenAlmacen) => {
    const lineas = contexto.lineas.lista;
    const lineaActiva =
        lineas.length > 0
            ? indice >= 0 && indice < lineas.length
                ? lineas[indice]
                : lineas[lineas.length - 1]
            : null;
    return {
        ...contexto,
        lineas: { ...contexto.lineas, activo: lineaActiva },
    };
};

export const onLineaCreada: ProcesarDetalle = async (contexto) => {
    return pipeOrden(contexto, [
        refrescarOrden,
        activarLineaPorIndice(contexto.lineas.lista.length),
    ]);
};

export const onLineaCambiada: ProcesarDetalle = async (contexto, payload) => {
    const linea = payload as LineaOrdenAlmacen;
    return pipeOrden(contexto, [
        refrescarOrden,
        activarLineaPorId(linea.id),
    ]);
};

export const onLineaBorrada: ProcesarDetalle = async (contexto, payload) => {
    const idLinea = payload as string;
    const indice = contexto.lineas.lista.findIndex((l) => l.id === idLinea);
    return pipeOrden(contexto, [
        refrescarOrden,
        activarLineaPorIndice(indice),
    ]);
};

const cargarOrdenPorId: (_: string) => ProcesarDetalle = (idOrden) => async (contexto) => {
    const orden = await getOrden(idOrden);
    return pipeOrden(contexto, [
        async (ctx) => ({
            ...ctx,
            orden,
            lineas: {
                lista: orden.lineas,
                total: orden.lineas.length,
                activo: null,
            },
        }),
        activarLineaPorIndice(0),
        'ABIERTA',
    ]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idOrden = payload as string;
    if (idOrden) {
        return cargarOrdenPorId(idOrden)(contexto);
    }
    return {
        ...contexto,
        estado: 'INICIAL',
        orden: ordenVacia(),
        lineas: listaEntidadesInicial<LineaOrdenAlmacen>(),
    };
};
