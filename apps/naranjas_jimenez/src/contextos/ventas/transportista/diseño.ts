import { Criteria } from "@olula/lib/diseño.js";

export type ItemListaTransportista = {
    id: string;
    descripcion: string;
};


export type GetItemsListaTransportista = (criteria: Criteria) => Promise<ItemListaTransportista[]>;