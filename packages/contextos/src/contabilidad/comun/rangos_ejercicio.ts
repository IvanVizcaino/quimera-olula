/**
 * «Todos los asientos» y «Todas las subcuentas» de los libros diario y mayor
 * (Eneboo `co_i_diario.qs` y `co_i_mayor.qs`, funciones `todosAsientos` y
 * `todasSubcuentas`):
 *
 * - Al marcar «Todos los asientos» se rellena desde/hasta con el primer y el
 *   último número de asiento del ejercicio (`MIN/MAX(numero)` de
 *   `co_asientos`) y los campos quedan deshabilitados. Al desmarcar se
 *   habilitan y conservan lo que tenían.
 * - Al marcar «Todas las subcuentas» se rellena desde/hasta con la primera y
 *   la última subcuenta del ejercicio (`MIN/MAX(codsubcuenta)` de
 *   `co_subcuentas`) y se deshabilitan. Al desmarcar se vacían y se
 *   habilitan.
 * - Al abrir el formulario (alta o edición) con la casilla marcada, o al
 *   cambiar de ejercicio, se vuelve a rellenar con los extremos del
 *   ejercicio.
 */
import { Criteria, Modelo } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { aBooleano } from "./checks_informe.ts";

/** Primer y último valor del ejercicio, ya como texto del formulario. */
export type Extremos = [string, string];

export interface ExtremosEjercicio {
    asientos: Extremos | null;
    subcuentas: Extremos | null;
}

export const SIN_EXTREMOS: ExtremosEjercicio = {
    asientos: null,
    subcuentas: null,
};

export interface RangoAsientosFormulario {
    todosAsientos: boolean;
    asientoDesde: string;
    asientoHasta: string;
}

export interface RangoSubcuentasFormulario {
    todasSubcuentas: boolean;
    subcuentaDesde: string;
    subcuentaHasta: string;
}

/** Criteria del primer (`ASC`) o último (`DESC`) registro del ejercicio por
 * `campo`: una sola fila, sin contar más de la cuenta. */
export const criteriaExtremo = (
    campo: string,
    ejercicioId: string,
    sentido: "ASC" | "DESC"
): Criteria => ({
    ...criteriaDefecto,
    filtro: [["ejercicio_id", "=", ejercicioId]],
    orden: [campo, sentido],
    paginacion: { limite: 1, pagina: 1 },
});

const tieneAsientos = (modelo: Modelo): boolean => "todosAsientos" in modelo;

const tieneSubcuentas = (modelo: Modelo): boolean =>
    "todasSubcuentas" in modelo;

const rangoAsientosRellenado = <T extends Modelo>(
    modelo: T,
    extremos: Extremos | null
): T => {
    if (!tieneAsientos(modelo) || !aBooleano(modelo.todosAsientos)) return modelo;
    if (!extremos) return modelo;
    const [desde, hasta] = extremos;
    if (modelo.asientoDesde === desde && modelo.asientoHasta === hasta)
        return modelo;
    return { ...modelo, asientoDesde: desde, asientoHasta: hasta };
};

const rangoSubcuentasRellenado = <T extends Modelo>(
    modelo: T,
    extremos: Extremos | null
): T => {
    if (!tieneSubcuentas(modelo) || !aBooleano(modelo.todasSubcuentas))
        return modelo;
    if (!extremos) return modelo;
    const [desde, hasta] = extremos;
    if (modelo.subcuentaDesde === desde && modelo.subcuentaHasta === hasta)
        return modelo;
    return { ...modelo, subcuentaDesde: desde, subcuentaHasta: hasta };
};

/**
 * Rellena los rangos cuyas casillas «todos/todas» están marcadas con los
 * extremos del ejercicio. Devuelve el mismo objeto si no cambia nada, para
 * no disparar guardados de más.
 */
export const rangosRellenados = <T extends Modelo>(
    modelo: T,
    extremos: ExtremosEjercicio
): T =>
    rangoSubcuentasRellenado(
        rangoAsientosRellenado(modelo, extremos.asientos),
        extremos.subcuentas
    );

/**
 * Deja los rangos como Eneboo tras cualquier cambio de casilla o de
 * ejercicio: con la casilla marcada, los extremos del ejercicio; al
 * desmarcar «todas las subcuentas» (`subcuentasPrevias` era `true`), los dos
 * códigos vacíos. Al desmarcar «todos los asientos» se conservan los
 * números. Devuelve el mismo objeto si no cambia nada.
 */
export const rangosSincronizados = <T extends Modelo>(
    modelo: T,
    subcuentasPrevias: boolean | null,
    extremos: ExtremosEjercicio
): T => {
    const desmarcadas =
        tieneSubcuentas(modelo) &&
        subcuentasPrevias === true &&
        !aBooleano(modelo.todasSubcuentas);
    const base =
        desmarcadas && (modelo.subcuentaDesde !== "" || modelo.subcuentaHasta !== "")
            ? { ...modelo, subcuentaDesde: "", subcuentaHasta: "" }
            : modelo;
    return rangosRellenados(base, extremos);
};

/** Con «todas las subcuentas» desmarcado hay que decir desde y hasta
 * (Eneboo: «Debe especificar las subcuentas»). */
export const subcuentasRequeridas = (
    modelo: Pick<RangoSubcuentasFormulario, "todasSubcuentas">
): boolean => !aBooleano(modelo.todasSubcuentas);
