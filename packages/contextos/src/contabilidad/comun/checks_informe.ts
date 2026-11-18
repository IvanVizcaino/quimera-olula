/**
 * Casillas (checks) de las fichas de informes de contabilidad.
 *
 * Los campos `bool` de las tablas `co_i_*` se editan con `QCheckbox`, pero
 * `useModelo` solo los pinta como casilla si el meta del campo dice
 * `tipo: "checkbox"` (sin él, `uiProps` manda `tipo: "texto"` y la casilla
 * se convierte en una caja de texto). Además, al marcar o desmarcar, el
 * valor llega al modelo como cadena ("true"/"false"): se vuelve a convertir a
 * booleano en el `onChange` del meta para que las reglas del formulario (qué
 * campos se deshabilitan) y la API reciban `true`/`false` de verdad.
 */
import { MetaCampo, MetaModelo } from "@olula/lib/dominio.ts";
import { Modelo } from "@olula/lib/diseño.ts";

/** `true`, `"true"` o `"1"`; cualquier otra cosa es `false`. */
export const aBooleano = (valor: unknown): boolean =>
    valor === true || valor === "true" || valor === "1";

/** Meta de los campos que se editan como casilla. */
export const camposCheck = <T extends Modelo>(
    campos: readonly string[]
): Record<string, MetaCampo<T>> =>
    Object.fromEntries(
        campos.map((campo) => [campo, { tipo: "checkbox" as const }])
    );

/** El modelo con los campos de casilla como booleanos. Devuelve el mismo
 * objeto si ya lo eran. */
export const checksNormalizados = <T extends Modelo>(
    modelo: T,
    campos: readonly string[]
): T => {
    const pendientes = campos.filter(
        (campo) => campo in modelo && typeof modelo[campo] !== "boolean"
    );
    if (pendientes.length === 0) return modelo;
    return {
        ...modelo,
        ...Object.fromEntries(
            pendientes.map((campo) => [campo, aBooleano(modelo[campo])])
        ),
    };
};

/**
 * Añade a un meta las casillas `checks`: su `tipo: "checkbox"` y, tras cada
 * cambio, su conversión a booleano. `ajustar` aplica después las reglas del
 * formulario (lo que en Eneboo hace `bufferChanged`).
 */
export const conChecks = <T extends Modelo>(
    meta: MetaModelo<T>,
    checks: readonly string[],
    ajustar?: (modelo: T, campo: string) => T
): MetaModelo<T> => ({
    ...meta,
    campos: { ...camposCheck<T>(checks), ...meta.campos },
    onChange: (modelo, campo, valorAnterior, otros) => {
        const base = meta.onChange
            ? meta.onChange(modelo, campo, valorAnterior, otros)
            : modelo;
        const normalizado = checksNormalizados(base, checks);
        return ajustar ? ajustar(normalizado, campo) : normalizado;
    },
});
