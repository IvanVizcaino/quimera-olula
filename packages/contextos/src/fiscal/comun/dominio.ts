import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";

/** Filtro "contiene" de los listados de Fiscalidad. */
export const filtroTexto = (campo: string, label: string) => ({
    id: campo,
    campo,
    label,
    filtro: (valor: unknown) => {
        if (!valor || valor === "") return null;
        return [campo, "~", valor as string] as [string, string, string];
    },
});

export const metaFiltroCodigoDescripcion: MetaFiltro = {
    id: filtroTexto("id", "Código"),
    descripcion: filtroTexto("descripcion", "Descripción"),
};

export const texto = (valor: unknown): string => (valor === null || valor === undefined ? "" : String(valor));

export const numero = (valor: unknown): number => Number(valor ?? 0) || 0;

/** Campos que han cambiado entre dos entidades, con su nombre en la API. */
export const camposCambiados = <T extends object>(
    previo: T,
    actual: T,
    mapa: [keyof T, string, ((v: unknown) => unknown)?][],
): Record<string, unknown> => {
    const cambios: Record<string, unknown> = {};
    for (const [campo, campoApi, convertir] of mapa) {
        if (actual[campo] !== previo[campo]) {
            const valor = actual[campo] as unknown;
            cambios[campoApi] = convertir ? convertir(valor) : valor;
        }
    }
    return cambios;
};

export const textoONull = (v: unknown): string | null => texto(v).trim() || null;
