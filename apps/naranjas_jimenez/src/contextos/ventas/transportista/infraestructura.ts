import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { GetItemsListaTransportista, ItemListaTransportista } from "./diseño.ts";

const baseUrl = new ApiUrls().TRANSPORTISTA;

type ItemListaTransportistaApi = {
    id: string;
    descripcion: string;
};

const itemListaTransportistaDesdeApi = (item: ItemListaTransportistaApi): ItemListaTransportista => ({
    id: item.id,
    descripcion: item.descripcion
})

export const getItemsListaTransportista: GetItemsListaTransportista = async (criteria) => {

    return RestAPI.get<{ datos: ItemListaTransportistaApi[] }>(
        `${baseUrl}/items_lista` + criteriaQuery(criteria.filtro, criteria.orden, criteria.paginacion)
    ).then((respuesta) => respuesta.datos.map(itemListaTransportistaDesdeApi));
}