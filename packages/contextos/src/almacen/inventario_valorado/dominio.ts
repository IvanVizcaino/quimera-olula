import { ClausulaFiltro, Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";

export interface FiltrosInventarioValorado {
    almacenId?: string;
    referencia?: string;
}

export const criteriaInventarioValorado = (filtros: FiltrosInventarioValorado): Criteria => {
    const clausulas: ClausulaFiltro[] = [];
    if (filtros.almacenId?.trim()) {
        clausulas.push(["almacen_id", "eq", filtros.almacenId.trim()]);
    }
    if (filtros.referencia?.trim()) {
        clausulas.push(["referencia", "eq", filtros.referencia.trim()]);
    }
    return {
        ...criteriaDefecto,
        filtro: clausulas as Filtro,
    };
};

export const nombreFicheroPdfInventarioValorado = (): string => "inventario-valorado.pdf";
