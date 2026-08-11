import { Criteria } from "@olula/lib/diseño.js";

export type ItemListaTipoPalet = {
    id: string;
    descripcion: string;
    idTipoEnvase: string;
    cantidadEnvase: number;
};


export type GetItemsListaTipoPalet = (criteria: Criteria) => Promise<ItemListaTipoPalet[]>;