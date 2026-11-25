import { MetaModelo } from "@olula/lib/dominio.ts";
import { motivoTextoNoValido, primerError } from "../comun/dominio.ts";
import { NuevaSeccion, Seccion } from "./diseño.ts";

/** Longitudes de pr_secciones.mtd. */
export const LONGITUD_CODIGO_SECCION = 10;
export const LONGITUD_DESCRIPCION_SECCION = 50;

export const validarSeccion = (s: Pick<NuevaSeccion, "id" | "descripcion">): string | true =>
    primerError(
        motivoTextoNoValido(s.id, "El código", LONGITUD_CODIGO_SECCION),
        motivoTextoNoValido(s.descripcion, "La descripción", LONGITUD_DESCRIPCION_SECCION),
    );

const campos = {
    id: { requerido: true },
    descripcion: { requerido: true },
};

export const seccionVacia = (): Seccion => ({ id: "", descripcion: "" });

/** Constante estable (no función) para el formulario de alta. */
export const nuevaSeccionVacia: NuevaSeccion = { id: "", descripcion: "" };

export const metaSeccion: MetaModelo<Seccion> = { campos, validacion: validarSeccion };
export const metaNuevaSeccion: MetaModelo<NuevaSeccion> = { campos, validacion: validarSeccion };
