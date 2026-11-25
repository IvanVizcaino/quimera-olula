import { MetaModelo } from "@olula/lib/dominio.ts";
import { motivoNumeroNoValido, motivoTextoNoValido, primerError, sinTexto } from "../comun/dominio.ts";
import { nombreTarea } from "../tipo_proceso/dominio.ts";
import { NuevoTiempoTarea, TiempoTarea } from "./diseño.ts";

/** Longitud de la referencia del artículo en pr_costestarea.mtd. */
export const LONGITUD_ARTICULO_TIEMPO = 22;

export const validarTiempoTarea = (t: NuevoTiempoTarea): string | true =>
    primerError(
        sinTexto(t.tipoCentroId) ? "El tipo de centro es obligatorio" : null,
        sinTexto(t.tareaProcesoId) ? "La tarea es obligatoria" : null,
        motivoTextoNoValido(t.articuloId, "El artículo", LONGITUD_ARTICULO_TIEMPO, false),
        motivoNumeroNoValido(t.costeInicial, "El tiempo inicial"),
        motivoNumeroNoValido(t.costeUnidad, "El tiempo por unidad"),
    );

const campos = {
    tipoCentroId: { requerido: true },
    tareaProcesoId: { requerido: true },
    articuloId: { requerido: false },
    costeInicial: { requerido: false, tipo: "numero" as const },
    costeUnidad: { requerido: false, tipo: "numero" as const },
};

export const tiempoTareaVacio = (): TiempoTarea => ({
    id: "", tipoCentroId: "", tipoCentro: "", tareaProcesoId: "", tarea: "", codigoTarea: "", tipoProcesoId: "",
    tipoProceso: "", articuloId: "", articulo: "", costeInicial: null, costeUnidad: null,
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoTiempoTareaVacio: NuevoTiempoTarea = {
    tipoCentroId: "", tareaProcesoId: "", articuloId: "", articulo: "", costeInicial: null, costeUnidad: null,
};

export const metaTiempoTarea: MetaModelo<TiempoTarea> = { campos, validacion: validarTiempoTarea };
export const metaNuevoTiempoTarea: MetaModelo<NuevoTiempoTarea> = { campos, validacion: validarTiempoTarea };

/** La tarea del tiempo como en el selector: «tipo de proceso · código - descripción». */
export const tareaDelTiempo = (t: Pick<TiempoTarea, "tipoProcesoId" | "codigoTarea" | "tarea">): string =>
    [t.tipoProcesoId, nombreTarea(t.codigoTarea, t.tarea)].filter(Boolean).join(" · ");

/** "Todos" si el tiempo no es de un artículo concreto. */
export const articuloDelTiempo = (t: Pick<TiempoTarea, "articuloId" | "articulo">): string =>
    t.articuloId ? [t.articuloId, t.articulo].filter(Boolean).join(" - ") : "Todos";
