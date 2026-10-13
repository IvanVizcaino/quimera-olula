import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { Composicion } from "../diseño.ts";
import { composicionVacia } from "../dominio.ts";
import { getComposicion } from "../infraestructura.ts";
import { ContextoComposicion, EstadoComposicion } from "./diseño.ts";

type ProcesarComposicion = ProcesarContexto<EstadoComposicion, ContextoComposicion>;

export const contextoComposicionInicial = (): ContextoComposicion => {
    const vacia = composicionVacia();
    return { estado: "INICIAL", composicion: vacia, composicionInicial: vacia };
};

export const cargarContexto: ProcesarComposicion = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        const vacia = composicionVacia();
        return { ...contexto, estado: "INICIAL", composicion: vacia, composicionInicial: vacia };
    }
    const composicion = await getComposicion(id);
    return { ...contexto, estado: "Editando", composicion, composicionInicial: composicion };
};

/** Recarga tras guardar/generar y avisa al maestro para refrescar la fila. */
export const refrescarComposicion: ProcesarComposicion = async (contexto) => {
    const composicion: Composicion = await getComposicion(contexto.composicion.id);
    return [
        { ...contexto, estado: "Editando", composicion, composicionInicial: composicion },
        [["composicion_cambiada", composicion]],
    ];
};

export const cancelarEdicion: ProcesarComposicion = async (ctx) => ({
    ...ctx,
    composicion: ctx.composicionInicial,
});
