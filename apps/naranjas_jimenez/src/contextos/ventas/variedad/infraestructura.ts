import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { GetItemsListaSeleccionVariedad, GetItemsListaVariedad, ItemListaVariedad } from "./diseño.ts";

const baseUrl = new ApiUrls().VARIEDAD;

type ItemListaVariedadApi = {
    id: string;
    descripcion: string;
};

const itemListaVariedadDesdeApi = (item: ItemListaVariedadApi): ItemListaVariedad => ({
    id: item.id,
    descripcion: item.descripcion
})

export const getItemsListaVariedad: GetItemsListaVariedad = async (filtro, orden) => {

    return RestAPI.get<{ datos: ItemListaVariedadApi[] }>(
        `${baseUrl}/items_lista` + criteriaQuery(filtro, orden)
    ).then((respuesta) => respuesta.datos.map(itemListaVariedadDesdeApi));
}

export const getItemsListaSeleccionVariedad: GetItemsListaSeleccionVariedad = async (filtro, orden, paginacion) => {

    return RestAPI.get<{ datos: ItemListaVariedadApi[] }>(
        `${baseUrl}/items_lista` + criteriaQuery(filtro, orden, paginacion)
    ).then((respuesta) => respuesta.datos.map(itemListaVariedadDesdeApi));
}