import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { IaMemoria } from "../diseño.js";
import { iaMemoriaVacia } from "../dominio.js";
import { getIaMemoria, patchIaMemoria } from "../infraestructura.js";
import { ContextoDetalleIaMemoria, EstadoDetalleIaMemoria } from "./diseño.js";

/**
 * Tipo para handlers del detalle
 */
type ProcesarDetalle = ProcesarContexto<EstadoDetalleIaMemoria, ContextoDetalleIaMemoria>;

/**
 * Alias de pipe para este contexto.
 */
const pipeIaMemoria = ejecutarListaProcesos<EstadoDetalleIaMemoria, ContextoDetalleIaMemoria>;

export const contextoDetalleIaMemoriaInicial: ContextoDetalleIaMemoria = {
    estado: 'INICIAL',
    iaMemoria: iaMemoriaVacia,
};

/**
 * Refresca la cabecera desde la API.
 * También emite el evento "ia_memoria_cambiada" hacia el maestro para sincronizar la lista.
 */
export const refrescarIaMemoria: ProcesarDetalle = async (contexto) => {
    const iaMemoria = await getIaMemoria(contexto.iaMemoria.id);
    return [
        { ...contexto, iaMemoria },
        [["ia_memoria_cambiada", iaMemoria]],
    ];
};

/**
 * Guarda cambios en la API.
 * Se llama desde el auto-guardado de useModelo (ver DetalleIaMemoria.tsx).
 * No incluye `activo`: se alterna aparte con alternarActivoIaMemoria.
 */
export const guardarIaMemoria = async (
    contexto: ContextoDetalleIaMemoria,
    iaMemoria: IaMemoria
): Promise<void> => {
    if (
        iaMemoria.titulo !== contexto.iaMemoria.titulo ||
        iaMemoria.contenido !== contexto.iaMemoria.contenido
    ) {
        await patchIaMemoria(iaMemoria.id, {
            titulo: iaMemoria.titulo,
            contenido: iaMemoria.contenido,
        });
    }
};

/**
 * Alterna el estado activo/inactivo de la memoria.
 * No se implementa como campo de formulario (ver nota en metaIaMemoria):
 * llama directamente a la API y refresca, propagando el cambio al maestro.
 */
export const alternarActivoIaMemoria: ProcesarDetalle = async (contexto) => {
    await patchIaMemoria(contexto.iaMemoria.id, { activo: !contexto.iaMemoria.activo });
    const iaMemoria = await getIaMemoria(contexto.iaMemoria.id);
    return [
        { ...contexto, iaMemoria },
        [["ia_memoria_cambiada", iaMemoria]],
    ];
};

/**
 * Carga la memoria desde la API y la activa.
 */
export const cargarIaMemoria: (_: string) => ProcesarDetalle =
    (idIaMemoria) => async (contexto) => {
        const iaMemoria = await getIaMemoria(idIaMemoria);
        return pipeIaMemoria(contexto, [
            async (ctx) => ({ ...ctx, iaMemoria }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idIaMemoria = payload as string;
    if (idIaMemoria) {
        return cargarIaMemoria(idIaMemoria)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', iaMemoria: iaMemoriaVacia };
};
