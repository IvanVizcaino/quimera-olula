import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import {
    accionesListaEntidades,
    listaEntidadesInicial,
    ProcesarListaEntidades,
} from "@olula/lib/ListaEntidades.js";
import { PrecioArticulo } from "../diseño.ts";
import { getPreciosArticuloCliente } from "../infraestructura.ts";
import { ContextoPreciosArticulo, EstadoPreciosArticulo } from "./diseño.ts";

type Procesar = ProcesarContexto<EstadoPreciosArticulo, ContextoPreciosArticulo>;

const pipe = ejecutarListaProcesos<EstadoPreciosArticulo, ContextoPreciosArticulo>;

const conPrecios = (fn: ProcesarListaEntidades<PrecioArticulo>) =>
    (ctx: ContextoPreciosArticulo) => ({ ...ctx, precios: fn(ctx.precios) });

export const Precios = accionesListaEntidades(conPrecios);

export const contextoInicial = (clienteId: string): ContextoPreciosArticulo => ({
    estado: "INICIAL",
    clienteId,
    precios: listaEntidadesInicial<PrecioArticulo>(),
});

const refrescar: Procesar = async (contexto) => {
    const { datos, total } = await getPreciosArticuloCliente(contexto.clienteId);
    return { ...contexto, precios: { ...contexto.precios, lista: datos, total } };
};

const activarPorId = (id: string | null): Procesar => async (contexto) => ({
    ...contexto,
    precios: {
        ...contexto.precios,
        activo: contexto.precios.lista.find((p) => p.id === id) ?? null,
    },
});

export const cargar: Procesar = async (contexto, payload) =>
    pipe({ ...contexto, clienteId: payload as string }, [
        refrescar,
        activarPorId(null),
        async (ctx) => ({ ...ctx, estado: "ABIERTO" as const }),
    ]);

export const onCreado: Procesar = async (contexto, payload) =>
    pipe(contexto, [refrescar, activarPorId(payload as string)]);

export const onCambiado: Procesar = async (contexto, payload) =>
    pipe(contexto, [refrescar, activarPorId((payload as PrecioArticulo).id)]);

export const onBorrado: Procesar = async (contexto) =>
    pipe(contexto, [refrescar, activarPorId(null)]);
