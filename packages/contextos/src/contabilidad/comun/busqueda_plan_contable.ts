import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Cuenta } from "#/contabilidad/cuenta/diseño.ts";
import { getCuentas } from "#/contabilidad/cuenta/infraestructura.ts";
import { Subcuenta } from "#/contabilidad/subcuenta/diseño.ts";
import { getSubcuentas } from "#/contabilidad/subcuenta/infraestructura.ts";

/**
 * Búsquedas de cuentas y subcuentas de un ejercicio para los campos con
 * desplegable (partidas de asientos manuales, series, impuestos...): el texto
 * escrito se busca en el código o en la descripción, dentro del ejercicio.
 */
export const filtroCodigoONombre = (ejercicioId: string, texto: string): Filtro =>
    texto.trim().length
        ? {
              and: [
                  ["ejercicio_id", ejercicioId],
                  {
                      or: [
                          ["codigo", "~", texto.trim()],
                          ["nombre", "~", texto.trim()],
                      ],
                  },
              ],
          }
        : [["ejercicio_id", ejercicioId]];

const filtroCodigo = (ejercicioId: string, codigo: string): Filtro => ({
    and: [
        ["ejercicio_id", ejercicioId],
        ["codigo", codigo.trim()],
    ],
});

const criteria = (filtro: Filtro, limite: number): Criteria => ({
    ...criteriaDefecto,
    filtro,
    orden: ["codigo", "ASC"],
    paginacion: { pagina: 1, limite },
});

export const buscarSubcuentas = async (
    ejercicioId: string,
    texto: string,
    limite = 20
): Promise<Subcuenta[]> => {
    if (!ejercicioId) return [];
    const { datos } = await getSubcuentas(criteria(filtroCodigoONombre(ejercicioId, texto), limite));
    return datos;
};

export const buscarCuentas = async (
    ejercicioId: string,
    texto: string,
    limite = 50
): Promise<Cuenta[]> => {
    if (!ejercicioId) return [];
    const { datos } = await getCuentas(criteria(filtroCodigoONombre(ejercicioId, texto), limite));
    return datos;
};

/** La subcuenta del ejercicio con ese código exacto, o null si no está. */
export const subcuentaPorCodigo = async (
    ejercicioId: string,
    codigo: string
): Promise<Subcuenta | null> => {
    if (!ejercicioId || !codigo.trim()) return null;
    const { datos } = await getSubcuentas(criteria(filtroCodigo(ejercicioId, codigo), 1));
    return datos[0] ?? null;
};

/** La cuenta del ejercicio con ese código exacto, o null si no está. */
export const cuentaPorCodigo = async (
    ejercicioId: string,
    codigo: string
): Promise<Cuenta | null> => {
    if (!ejercicioId || !codigo.trim()) return null;
    const { datos } = await getCuentas(criteria(filtroCodigo(ejercicioId, codigo), 1));
    return datos[0] ?? null;
};

/** Lo que se ve en el campo y en el desplegable: «código — descripción». */
export const codigoYNombre = (codigo: string, nombre?: string | null) =>
    nombre?.trim() ? `${codigo} — ${nombre.trim()}` : codigo;
