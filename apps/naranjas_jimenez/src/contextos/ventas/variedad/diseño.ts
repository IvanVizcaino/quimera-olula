import { Filtro, Orden, Paginacion } from "@olula/lib/diseño.js";

export type ItemListaVariedad = {
    id: string;
    descripcion: string;
};


export type GetItemsListaVariedad = (filtro: Filtro, orden: Orden) => Promise<ItemListaVariedad[]>;
export type GetItemsListaSeleccionVariedad = (filtro: Filtro, orden: Orden, paginacion?: Paginacion) => Promise<ItemListaVariedad[]>;