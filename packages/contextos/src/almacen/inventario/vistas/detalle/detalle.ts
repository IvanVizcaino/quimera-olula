import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import {
    accionesListaEntidades,
    listaEntidadesInicial,
    ProcesarListaEntidades,
} from "@olula/lib/ListaEntidades.js";
import {
    LineaInventario,
    ResultadoCerrarInventario,
    ResultadoRegularizacionInventario,
} from "../../diseño.ts";
import { inventarioVacio } from "../../dominio.ts";
import {
    descargarBlobComoFichero,
    getExportLineasInventarioCsv,
    getInventario,
    getLineasInventario,
} from "../../infraestructura.ts";
import { ContextoDetalleInventario, EstadoDetalleInventario } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleInventario, ContextoDetalleInventario>;

const pipeInventario = ejecutarListaProcesos<EstadoDetalleInventario, ContextoDetalleInventario>;

const conLineas = (fn: ProcesarListaEntidades<LineaInventario>) =>
    (ctx: ContextoDetalleInventario) => ({ ...ctx, lineas: fn(ctx.lineas) });

export const Lineas = accionesListaEntidades(conLineas);

export const refrescarInventario: ProcesarDetalle = async (contexto) => {
    const inventario = await getInventario(contexto.inventario.id);
    const lista = await getLineasInventario(contexto.inventario.id);
    return [
        {
            ...contexto,
            inventario,
            lineas: {
                ...contexto.lineas,
                lista,
                total: lista.length,
            },
        },
        [["inventario_cambiado", inventario]],
    ];
};

const activarLineaPorId = (id: string) => async (contexto: ContextoDetalleInventario) => {
    const lineaActiva = contexto.lineas.lista.find((l) => l.id === id) ?? null;
    return { ...contexto, lineas: { ...contexto.lineas, activo: lineaActiva } };
};

export const onLineaCreada: ProcesarDetalle = async (contexto, payload) => {
    const idLinea = payload as string;
    return pipeInventario(contexto, [refrescarInventario, activarLineaPorId(idLinea)]);
};

export const onRegularizacionCompletada: ProcesarDetalle = async (contexto, payload) =>
    pipeInventario(
        { ...contexto, resultadoRegularizacion: payload as ResultadoRegularizacionInventario },
        [refrescarInventario, "ABIERTO"]
    );

export const onRestoACeroCompletado: ProcesarDetalle = async (contexto) =>
    pipeInventario(contexto, [refrescarInventario, "ABIERTO"]);

export const onImportacionCsvCompletada: ProcesarDetalle = async (contexto) =>
    pipeInventario(contexto, [refrescarInventario, "ABIERTO"]);

export const onInventarioCerrado: ProcesarDetalle = async (contexto, payload) => {
    const res = payload as ResultadoCerrarInventario;
    return pipeInventario(contexto, [
        async (ctx) => ({
            ...ctx,
            inventario: { ...ctx.inventario, cerrado: res.cerrado },
        }),
        refrescarInventario,
        "ABIERTO",
    ]);
};

export const onExportarCsv: ProcesarDetalle = async (contexto) => {
    const blob = await getExportLineasInventarioCsv(contexto.inventario.id);
    descargarBlobComoFichero(blob, `${contexto.inventario.id}-lineas.csv`);
    return contexto;
};

const cargarInventario = (id: string): ProcesarDetalle => async (contexto) => {
    const inventario = await getInventario(id);
    const lista = await getLineasInventario(id);
    return pipeInventario(contexto, [
        async (ctx) => ({
            ...ctx,
            inventario,
            lineas: {
                lista,
                total: lista.length,
                activo: lista[0] ?? null,
            },
        }),
        "ABIERTO",
    ]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarInventario(id)(contexto);
    }
    return {
        ...contexto,
        inventario: inventarioVacio(),
        lineas: listaEntidadesInicial<LineaInventario>(),
    };
};
