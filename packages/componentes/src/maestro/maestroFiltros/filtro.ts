import { ClausulaFiltro, Entidad } from "@olula/lib/diseño.ts";

export const filtrarEntidad = (
    entidad: Entidad,
    conjuntoFiltros: ClausulaFiltro[]
): boolean => {
    if (!conjuntoFiltros) return true;

    return conjuntoFiltros.every(([campo, operador, valor]) => {
        const claves = campo.split(".");

        const valorCampo = (
            claves.reduce(
                (objeto, clave) => objeto[clave] as Entidad,
                entidad
            ) as unknown as string
        )?.toLowerCase();

        if (operador === "~") {
            return valor
                ? valorCampo?.includes(valor.toLowerCase()) ?? false
                : false;
        }
        // Si en el futuro hay otros operadores, se pueden añadir aquí
        return true;
    });
};
