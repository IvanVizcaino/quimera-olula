/**
 * Primer y último asiento / subcuenta de un ejercicio, con las consultas de
 * listado que ya existen (`GET /contabilidad/asiento` y
 * `GET /contabilidad/subcuenta`): filtro por ejercicio, orden por número o
 * código y una sola fila. Equivale al `MIN/MAX` de Eneboo.
 */
import { getAsientos } from "#/contabilidad/asiento/infraestructura.ts";
import { getSubcuentas } from "#/contabilidad/subcuenta/infraestructura.ts";
import { criteriaExtremo, Extremos } from "./rangos_ejercicio.ts";

const extremos = async <T>(
    leer: (
        sentido: "ASC" | "DESC"
    ) => Promise<{ datos: T[] }>,
    valor: (fila: T) => string
): Promise<Extremos | null> => {
    const [primero, ultimo] = await Promise.all([leer("ASC"), leer("DESC")]);
    const desde = primero.datos[0];
    const hasta = ultimo.datos[0];
    if (!desde || !hasta) return null;
    return [valor(desde), valor(hasta)];
};

export const getExtremosAsientos = (
    ejercicioId: string
): Promise<Extremos | null> =>
    extremos(
        (sentido) =>
            getAsientos(criteriaExtremo("numero", ejercicioId, sentido)),
        (asiento) => String(asiento.numero)
    );

export const getExtremosSubcuentas = (
    ejercicioId: string
): Promise<Extremos | null> =>
    extremos(
        (sentido) =>
            getSubcuentas(criteriaExtremo("codigo", ejercicioId, sentido)),
        (subcuenta) => subcuenta.codigo
    );
