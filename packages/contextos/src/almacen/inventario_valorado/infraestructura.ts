import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaAQueryString } from "@olula/lib/infraestructura.ts";
import ApiUrls from "#/almacen/comun/urls.ts";
import {
    GetInventarioValorado,
    GetReportInventarioValorado,
    InventarioValoradoLeido,
    LineaInventarioValorado,
    TotalesInventarioValorado,
} from "./diseño.ts";

const urls = new ApiUrls();

interface LineaInventarioValoradoApi {
    almacen_id: string;
    almacen_nombre: string;
    referencia: string;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    valor: number;
    tipo_valoracion: string;
}

interface TotalesInventarioValoradoApi {
    total_general: number;
    por_almacen: Record<string, number>;
}

interface InventarioValoradoLeidoApi {
    lineas: LineaInventarioValoradoApi[];
    totales: TotalesInventarioValoradoApi;
    total: number;
}

export const lineaInventarioValoradoDesdeApi = (api: LineaInventarioValoradoApi): LineaInventarioValorado => ({
    id: `${api.almacen_id}-${api.referencia}`,
    almacenId: api.almacen_id,
    almacenNombre: api.almacen_nombre ?? "",
    referencia: api.referencia,
    descripcion: api.descripcion ?? "",
    cantidad: api.cantidad,
    precioUnitario: api.precio_unitario,
    valor: api.valor,
    tipoValoracion: api.tipo_valoracion ?? "",
});

export const totalesInventarioValoradoDesdeApi = (
    api: TotalesInventarioValoradoApi
): TotalesInventarioValorado => ({
    totalGeneral: api.total_general,
    porAlmacen: api.por_almacen ?? {},
});

export const inventarioValoradoDesdeApi = (api: InventarioValoradoLeidoApi): InventarioValoradoLeido => ({
    lineas: api.lineas.map(lineaInventarioValoradoDesdeApi),
    totales: totalesInventarioValoradoDesdeApi(api.totales),
    total: api.total,
});

export const urlReportInventarioValorado = (criteria: Criteria): string => {
    const q = criteriaAQueryString(criteria);
    return `${urls.INVENTARIO_VALORADO_REPORT}${q}`;
};

export const getInventarioValorado: GetInventarioValorado = async (criteria) => {
    const q = criteriaAQueryString(criteria);
    return RestAPI.getItem(
        `${urls.INVENTARIO_VALORADO}${q}`,
        inventarioValoradoDesdeApi,
        "Error al cargar inventario valorado"
    );
};

export const getReportInventarioValorado: GetReportInventarioValorado = async (criteria) =>
    RestAPI.blob(urlReportInventarioValorado(criteria), "Error al descargar PDF de inventario valorado");
