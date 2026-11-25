import { MetaModelo } from "@olula/lib/dominio.ts";
import { motivoNumeroNoValido, motivoTextoNoValido, primerError } from "../comun/dominio.ts";
import { NuevoTipoTarea, TipoTarea } from "./diseño.ts";

/** Longitudes de pr_tipostarea.mtd. */
export const LONGITUD_CODIGO_TIPO_TAREA = 20;
export const LONGITUD_DESCRIPCION_TIPO_TAREA = 100;

export const validarTipoTarea = (t: Pick<NuevoTipoTarea, "id" | "descripcion" | "tiempoMedio">): string | true =>
    primerError(
        motivoTextoNoValido(t.id, "El código", LONGITUD_CODIGO_TIPO_TAREA),
        motivoTextoNoValido(t.descripcion, "La descripción", LONGITUD_DESCRIPCION_TIPO_TAREA),
        motivoNumeroNoValido(t.tiempoMedio, "El tiempo medio"),
    );

const campos = {
    id: { requerido: true },
    descripcion: { requerido: true },
    tiempoMedio: { requerido: false, tipo: "numero" as const },
};

export const tipoTareaVacio = (): TipoTarea => ({ id: "", descripcion: "", tiempoMedio: null });

/** Constante estable (no función) para el formulario de alta. */
export const nuevoTipoTareaVacio: NuevoTipoTarea = { id: "", descripcion: "", tiempoMedio: null };

export const metaTipoTarea: MetaModelo<TipoTarea> = { campos, validacion: validarTipoTarea };
export const metaNuevoTipoTarea: MetaModelo<NuevoTipoTarea> = { campos, validacion: validarTipoTarea };
