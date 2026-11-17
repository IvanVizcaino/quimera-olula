import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import {
    accionesListaEntidades,
    listaEntidadesInicial,
    ProcesarListaEntidades,
} from "@olula/lib/ListaEntidades.js";
import { PartidaPlantilla, PlantillaAsiento } from "../diseño.ts";
import { partidasOrdenadas, plantillaAsientoVacia } from "../dominio.ts";
import { getPlantillaAsiento, patchPlantillaAsiento } from "../infraestructura.ts";
import {
    ContextoDetallePlantillaAsiento,
    EstadoDetallePlantillaAsiento,
} from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetallePlantillaAsiento,
    ContextoDetallePlantillaAsiento
>;

const pipePlantilla = ejecutarListaProcesos<
    EstadoDetallePlantillaAsiento,
    ContextoDetallePlantillaAsiento
>;

const conPartidas = (fn: ProcesarListaEntidades<PartidaPlantilla>) =>
    (ctx: ContextoDetallePlantillaAsiento) => ({ ...ctx, partidas: fn(ctx.partidas) });

export const Partidas = accionesListaEntidades(conPartidas);

/** El código es la clave (`codplanasiento`): no se cambia una vez creada. */
export const metaPlantillaAsiento: MetaModelo<PlantillaAsiento> = {
    campos: {
        id: { bloqueado: true },
        descripcion: { requerido: true, maximo: 255 },
        concatenar: { requerido: false, maximo: 6 },
    },
};

export const contextoDetallePlantillaInicial: ContextoDetallePlantillaAsiento = {
    estado: "INICIAL",
    plantilla: plantillaAsientoVacia(),
    partidas: listaEntidadesInicial<PartidaPlantilla>(),
};

const leerPlantilla = async (id: string): Promise<PlantillaAsiento> => {
    const plantilla = await getPlantillaAsiento(id);
    return { ...plantilla, partidas: partidasOrdenadas(plantilla) };
};

/** Una sola llamada trae la cabecera y las partidas. */
export const refrescarPlantilla: ProcesarDetalle = async (contexto) => {
    const plantilla = await leerPlantilla(contexto.plantilla.id);
    return [
        {
            ...contexto,
            plantilla,
            partidas: {
                ...contexto.partidas,
                lista: plantilla.partidas,
                total: plantilla.partidas.length,
            },
        },
        [["plantilla_cambiada", plantilla]],
    ];
};

export const guardarPlantilla = async (
    contexto: ContextoDetallePlantillaAsiento,
    plantilla: PlantillaAsiento
): Promise<void> => {
    const previa = contexto.plantilla;
    if (
        plantilla.descripcion !== previa.descripcion ||
        plantilla.concatenar !== previa.concatenar
    ) {
        await patchPlantillaAsiento(plantilla.id, {
            descripcion: plantilla.descripcion,
            concatenar: plantilla.concatenar,
        });
    }
};

const activarPartidaPorId = (id: string) => async (contexto: ContextoDetallePlantillaAsiento) => ({
    ...contexto,
    partidas: {
        ...contexto.partidas,
        activo: contexto.partidas.lista.find((p) => p.id === id) ?? null,
    },
});

const activarPartidaPorIndice = (indice: number) => async (contexto: ContextoDetallePlantillaAsiento) => {
    const lista = contexto.partidas.lista;
    const activo =
        lista.length > 0
            ? indice >= 0 && indice < lista.length
                ? lista[indice]
                : lista[lista.length - 1]
            : null;
    return { ...contexto, partidas: { ...contexto.partidas, activo } };
};

export const onPartidaCreada: ProcesarDetalle = async (contexto, payload) =>
    pipePlantilla(contexto, [refrescarPlantilla, activarPartidaPorId(payload as string)]);

export const onPartidaCambiada: ProcesarDetalle = async (contexto, payload) =>
    pipePlantilla(contexto, [
        refrescarPlantilla,
        activarPartidaPorId((payload as PartidaPlantilla).id),
    ]);

export const onPartidaBorrada: ProcesarDetalle = async (contexto, payload) => {
    const indice = contexto.partidas.lista.findIndex((p) => p.id === (payload as string));
    return pipePlantilla(contexto, [refrescarPlantilla, activarPartidaPorIndice(indice)]);
};

const cargarPlantilla = (id: string): ProcesarDetalle => async (contexto) => {
    const plantilla = await leerPlantilla(id);
    return pipePlantilla(contexto, [
        async (ctx) => ({
            ...ctx,
            plantilla,
            partidas: {
                lista: plantilla.partidas,
                total: plantilla.partidas.length,
                activo: null,
            },
        }),
        activarPartidaPorIndice(0),
        "ABIERTO",
    ]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarPlantilla(id)(contexto);
    }
    return { ...contextoDetallePlantillaInicial };
};
