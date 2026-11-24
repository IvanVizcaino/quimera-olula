import { MetaModelo } from "@olula/lib/dominio.ts";
import { motivoTextoNoValido, primerError } from "../comun/dominio.ts";
import { NuevoTrabajador, SeccionTrabajador, Trabajador } from "./diseño.ts";

/** Longitudes de pr_trabajadores.mtd (el código, libre: en Eneboo era el usuario de flusers). */
export const LONGITUD_CODIGO_TRABAJADOR = 30;
export const LONGITUD_NOMBRE_TRABAJADOR = 100;

export const validarTrabajador = (t: Pick<NuevoTrabajador, "id" | "nombre">): string | true =>
    primerError(
        motivoTextoNoValido(t.id, "El código", LONGITUD_CODIGO_TRABAJADOR),
        motivoTextoNoValido(t.nombre, "El nombre", LONGITUD_NOMBRE_TRABAJADOR),
    );

const campos = {
    id: { requerido: true },
    nombre: { requerido: true },
    seccionId: { requerido: false },
    deBaja: { requerido: false, tipo: "checkbox" as const },
};

export const trabajadorVacio = (): Trabajador => ({
    id: "", nombre: "", seccionId: "", seccion: "", deBaja: false, secciones: [],
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoTrabajadorVacio: NuevoTrabajador = { id: "", nombre: "", seccionId: "" };

export const metaTrabajador: MetaModelo<Trabajador> = { campos, validacion: validarTrabajador };
export const metaNuevoTrabajador: MetaModelo<NuevoTrabajador> = { campos, validacion: validarTrabajador };

/** Las secciones que aún se pueden añadir al trabajador. */
export const seccionesSinAsignar = <T extends { valor: string }>(opciones: T[], asignadas: SeccionTrabajador[]): T[] =>
    opciones.filter((o) => !asignadas.some((s) => s.seccionId === o.valor));
