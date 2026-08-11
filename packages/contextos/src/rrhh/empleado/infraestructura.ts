import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { TagEmpleado } from "./diseño.ts";

const baseUrlVentas = `/rrhh/empleado`;

type TagEmpleadoApi = {
    id: string;
    nombre: string;
}

const tagEmpleadoApi = (t: TagEmpleadoApi): TagEmpleado => ({
    id: t.id,
    nombre: t.nombre,
});

export const getTagsEmpleado = async (filtro: Filtro, orden: Orden): Promise<TagEmpleado[]> => {
    const q = criteriaQuery(filtro, orden);

    return RestAPI.get<{ datos: TagEmpleadoApi[] }>(`${baseUrlVentas}/tags${q}`).then((respuesta) => respuesta.datos.map(tagEmpleadoApi));
}