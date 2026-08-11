import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { IaFlujo } from "../diseño.js";
import { iaFlujoVacio } from "../dominio.js";
import { getIaFlujo, patchIaFlujo } from "../infraestructura.js";
import { ContextoDetalleIaFlujo, EstadoDetalleIaFlujo } from "./diseño.js";

/**
 * Tipo para handlers del detalle
 */
type ProcesarDetalle = ProcesarContexto<EstadoDetalleIaFlujo, ContextoDetalleIaFlujo>;

/**
 * Alias de pipe para este contexto.
 */
const pipeIaFlujo = ejecutarListaProcesos<EstadoDetalleIaFlujo, ContextoDetalleIaFlujo>;

export const contextoDetalleIaFlujoInicial: ContextoDetalleIaFlujo = {
    estado: 'INICIAL',
    iaFlujo: iaFlujoVacio,
};

/**
 * Refresca la cabecera desde la API.
 * También emite el evento "ia_flujo_cambiado" hacia el maestro para sincronizar la lista.
 */
export const refrescarIaFlujo: ProcesarDetalle = async (contexto) => {
    const iaFlujo = await getIaFlujo(contexto.iaFlujo.id);
    return [
        { ...contexto, iaFlujo },
        [["ia_flujo_cambiado", iaFlujo]],
    ];
};

/**
 * Guarda cambios en la API.
 * Se llama desde el auto-guardado de useModelo (ver DetalleIaFlujo.tsx).
 * No incluye `activo`: se alterna aparte con alternarActivoIaFlujo.
 */
export const guardarIaFlujo = async (
    contexto: ContextoDetalleIaFlujo,
    iaFlujo: IaFlujo
): Promise<void> => {
    if (
        iaFlujo.nombre !== contexto.iaFlujo.nombre ||
        iaFlujo.descripcionCorta !== contexto.iaFlujo.descripcionCorta ||
        iaFlujo.contenido !== contexto.iaFlujo.contenido
    ) {
        await patchIaFlujo(iaFlujo.id, {
            nombre: iaFlujo.nombre,
            descripcionCorta: iaFlujo.descripcionCorta,
            contenido: iaFlujo.contenido,
        });
    }
};

/**
 * Alterna el estado activo/inactivo del flujo.
 * No se implementa como campo de formulario (ver nota en metaIaFlujo):
 * llama directamente a la API y refresca, propagando el cambio al maestro.
 */
export const alternarActivoIaFlujo: ProcesarDetalle = async (contexto) => {
    await patchIaFlujo(contexto.iaFlujo.id, { activo: !contexto.iaFlujo.activo });
    const iaFlujo = await getIaFlujo(contexto.iaFlujo.id);
    return [
        { ...contexto, iaFlujo },
        [["ia_flujo_cambiado", iaFlujo]],
    ];
};

/**
 * Carga el flujo desde la API y lo activa.
 */
export const cargarIaFlujo: (_: string) => ProcesarDetalle =
    (idIaFlujo) => async (contexto) => {
        const iaFlujo = await getIaFlujo(idIaFlujo);
        return pipeIaFlujo(contexto, [
            async (ctx) => ({ ...ctx, iaFlujo }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idIaFlujo = payload as string;
    if (idIaFlujo) {
        return cargarIaFlujo(idIaFlujo)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', iaFlujo: iaFlujoVacio };
};
