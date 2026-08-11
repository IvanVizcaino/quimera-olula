import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import {
    accionesListaEntidades,
    listaEntidadesInicial,
    ProcesarListaEntidades,
} from "@olula/lib/ListaEntidades.js";
import { LineaModulo, ModLin } from "../diseño.js";
import { getModLin, patchModLin } from "../infraestructura.js";
import { ContextoDetalleModLin, EstadoDetalleModLin } from "./maquina.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleModLin, ContextoDetalleModLin>;

const pipeModLin = ejecutarListaProcesos<EstadoDetalleModLin, ContextoDetalleModLin>;

const conLineas = (fn: ProcesarListaEntidades<LineaModulo>) =>
    (ctx: ContextoDetalleModLin) => ({ ...ctx, lineas: fn(ctx.lineas) });

export const Lineas = accionesListaEntidades(conLineas);

export const metaModLin: MetaModelo<ModLin> = {
    campos: {
        campoString: { requerido: true, minimo: 3 },
    },
};

export const modLinVacio = (): ModLin => ({
    id: '',
    campoString: '',
    campoTexto: '',
    campoNumero: 0,
    campoOpcion: 'opcion1',
    campoFecha: new Date(),
    lineas: [],
});

/**
 * Recarga el módulo desde API y sincroniza lineas.lista desde modLin.lineas.
 * Una sola llamada cubre tanto la cabecera como las líneas.
 */
export const refrescarModLin: ProcesarDetalle = async (contexto) => {
    const modLin = await getModLin(contexto.modLin.id);
    return [
        {
            ...contexto,
            modLin,
            lineas: {
                ...contexto.lineas,           // preserva activo
                lista: modLin.lineas,
                total: modLin.lineas.length,
            },
        },
        [["modulo_cambiado", modLin]],
    ];
};

export const guardarModLin = async (
    contexto: ContextoDetalleModLin,
    modLin: ModLin
): Promise<void> => {
    if (modLin.campoString !== contexto.modLin.campoString) {
        await patchModLin(modLin.id, modLin);
    }
};

const activarLineaPorId = (id: string) => async (contexto: ContextoDetalleModLin) => {
    const lineaActiva = contexto.lineas.lista.find((l) => l.id === id) ?? null;
    return {
        ...contexto,
        lineas: { ...contexto.lineas, activo: lineaActiva },
    };
};

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoDetalleModLin) => {
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

export const onLineaCreada: ProcesarDetalle = async (contexto, payload) => {
    const idLinea = payload as string;
    return pipeModLin(contexto, [
        refrescarModLin,
        activarLineaPorId(idLinea),
    ]);
};

export const onLineaCambiada: ProcesarDetalle = async (contexto, payload) => {
    const linea = payload as LineaModulo;
    return pipeModLin(contexto, [
        refrescarModLin,
        activarLineaPorId(linea.id),
    ]);
};

export const onLineaBorrada: ProcesarDetalle = async (contexto, payload) => {
    const idLinea = payload as string;
    const indice = contexto.lineas.lista.findIndex((l) => l.id === idLinea);
    return pipeModLin(contexto, [
        refrescarModLin,
        activarLineaPorIndice(indice),
    ]);
};

const cargarModLin: (_: string) => ProcesarDetalle = (idModLin) => async (contexto) => {
    const modLin = await getModLin(idModLin); // incluye modLin.lineas
    return pipeModLin(contexto, [
        async (ctx) => ({
            ...ctx,
            modLin,
            lineas: {
                lista: modLin.lineas,
                total: modLin.lineas.length,
                activo: null,
            },
        }),
        activarLineaPorIndice(0),
        'ABIERTO',
    ]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idModLin = payload as string;
    if (idModLin) {
        return cargarModLin(idModLin)(contexto);
    }
    return {
        ...contexto,
        estado: 'INICIAL',
        modLin: modLinVacio(),
        lineas: listaEntidadesInicial<LineaModulo>(),
    };
};
