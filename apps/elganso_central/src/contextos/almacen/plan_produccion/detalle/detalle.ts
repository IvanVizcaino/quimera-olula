import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { CabeceraPlanProduccion } from "../diseño.ts";
import {
    anadirLinea, aplicarDestino, cabeceraPlanVacia, cambiarCantidad, cambiosCabecera,
    destinoDeCabecera, FilaResuelta, fusionarPegado, quitarLinea, rejillaModificada,
} from "../dominio.ts";
import {
    getPlanProduccion, getTallasArticulo, patchLineasPlanProduccion, patchPlanProduccion,
} from "../infraestructura.ts";
import { ContextoDetallePlanProduccion, EstadoDetallePlanProduccion } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetallePlanProduccion, ContextoDetallePlanProduccion>;

export const contextoDetallePlanInicial: ContextoDetallePlanProduccion = {
    estado: 'INICIAL',
    cabecera: cabeceraPlanVacia,
    lineas: [],
    rejilla: [],
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string | undefined;
    if (!id) return { ...contextoDetallePlanInicial, estado: 'INICIAL' };

    const { cabecera, lineas } = await getPlanProduccion(id);
    return { ...contexto, estado: 'ABIERTO', cabecera, lineas, rejilla: lineas };
};

/**
 * Refresca la cabecera tras guardarla. Proveedor, almacén y fecha de entrega se
 * aplican en el servidor a todas las líneas, así que si la rejilla tiene cambios
 * sin guardar se les aplica también el destino (si no, al guardar la rejilla se
 * revertiría) y se conservan; si no los tiene, se toma la rejilla del servidor.
 */
export const refrescarCabecera: ProcesarDetalle = async (contexto) => {
    const { cabecera, lineas } = await getPlanProduccion(contexto.cabecera.id);
    const rejilla = rejillaModificada(contexto.lineas, contexto.rejilla)
        ? aplicarDestino(contexto.rejilla, destinoDeCabecera(cabecera))
        : lineas;
    return [
        { ...contexto, cabecera, lineas, rejilla },
        [["plan_cambiado", cabecera]],
    ];
};

/** Auto-guardado de la cabecera (se llama desde useModelo). */
export const guardarPlan = async (
    contexto: ContextoDetallePlanProduccion,
    cabecera: CabeceraPlanProduccion
): Promise<void> => {
    const cambios = cambiosCabecera(contexto.cabecera, cabecera);
    if (Object.keys(cambios).length > 0) {
        await patchPlanProduccion(cabecera.id, cambios);
    }
};

export const cambiarCantidadRejilla: ProcesarDetalle = async (contexto, payload) => {
    const { indice, talla, cantidad } = payload as { indice: number; talla: string; cantidad: number };
    return { ...contexto, rejilla: cambiarCantidad(contexto.rejilla, indice, talla, cantidad) };
};

export const quitarLineaRejilla: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    rejilla: quitarLinea(contexto.rejilla, payload as number),
});

/** Consulta las tallas de la referencia (error si no existe) y añade la línea. */
export const anadirLineaRejilla: ProcesarDetalle = async (contexto, payload) => {
    const referencia = String(payload ?? "").trim();
    if (!referencia) return contexto;

    const [articulo] = await getTallasArticulo([referencia]);
    if (!articulo) {
        throw { nombre: "Referencia no encontrada", descripcion: `La referencia ${referencia} no existe` };
    }
    return {
        ...contexto,
        rejilla: anadirLinea(contexto.rejilla, articulo, destinoDeCabecera(contexto.cabecera)),
    };
};

export const descartarRejilla: ProcesarDetalle = async (contexto) => ({
    ...contexto,
    rejilla: contexto.lineas,
});

export const guardarRejilla: ProcesarDetalle = async (contexto) => {
    await patchLineasPlanProduccion(contexto.cabecera.id, contexto.rejilla);
    const { cabecera, lineas } = await getPlanProduccion(contexto.cabecera.id);
    return [
        { ...contexto, cabecera, lineas, rejilla: lineas },
        [["plan_cambiado", cabecera]],
    ];
};

/** Fusiona en la rejilla en memoria las filas válidas del modal de pegado. */
export const importarPegado: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    rejilla: fusionarPegado(contexto.rejilla, payload as FilaResuelta[], destinoDeCabecera(contexto.cabecera)),
});
