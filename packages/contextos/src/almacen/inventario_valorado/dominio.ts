import { ClausulaFiltro, Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";

export interface FiltrosInventarioValorado {
    almacenId?: string;
    referencia?: string;
    /** Ext. Eneboo `art_obsoletos` (R4): «Excluir Obsoletos» del diálogo del
     * informe. Nace desmarcado, al revés que el maestro de artículos. */
    excluirObsoletos?: boolean;
}

export const criteriaInventarioValorado = (filtros: FiltrosInventarioValorado): Criteria => {
    const clausulas: ClausulaFiltro[] = [];
    if (filtros.almacenId?.trim()) {
        clausulas.push(["almacen_id", "eq", filtros.almacenId.trim()]);
    }
    if (filtros.referencia?.trim()) {
        clausulas.push(["referencia", "eq", filtros.referencia.trim()]);
    }
    if (filtros.excluirObsoletos) {
        clausulas.push(["excluir_obsoletos", "eq", "true"]);
    }
    return {
        ...criteriaDefecto,
        filtro: clausulas as Filtro,
    };
};

export const nombreFicheroPdfInventarioValorado = (): string => "inventario-valorado.pdf";
