import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import {
    ArticuloTallas, CabeceraPlanProduccion, CambiosPlanProduccion, DeletePlanProduccion,
    EstadoPlanProduccion, GetPlanesProduccion, GetPlanProduccion, GetTallasArticulo, ItemPlanProduccion,
    LineaPlanProduccion, PatchLineasPlanProduccion, PatchPlanProduccion,
    PlanProduccion, PostPlanProduccion, TallaArticulo, TallaLinea,
} from "./diseño.ts";

const urls = new ApiUrls();
const baseUrl = urls.PLAN_PRODUCCION;

interface TallaArticuloApi {
    talla: string;
    descripcion: string;
    grupo: string | null;
    orden: number | null;
    barcode: string | null;
    color: string | null;
}

interface TallaLineaApi extends TallaArticuloApi {
    cantidad: number;
}

interface LineaApi {
    id: string;
    referencia: string;
    descripcion: string;
    proveedor_id: string | null;
    nombre_proveedor: string | null;
    almacen_id: string | null;
    nombre_almacen: string | null;
    fecha_entrega: string | null;
    cantidad: number;
    tallas: TallaLineaApi[];
}

interface ItemPlanApi {
    id: string;
    descripcion: string;
    fecha: string;
    fecha_solicitada: string | null;
    fecha_proveedor: string | null;
    estado: EstadoPlanProduccion;
    cantidad: number;
}

interface PlanApi extends ItemPlanApi {
    observaciones: string | null;
    proveedor_id: string | null;
    nombre_proveedor: string | null;
    almacen_id: string | null;
    nombre_almacen: string | null;
    fecha_entrega: string | null;
    lineas: LineaApi[];
}

interface ArticuloTallasApi {
    referencia: string;
    descripcion: string;
    tallas: TallaArticuloApi[];
}

const tallaArticuloDesdeApi = (t: TallaArticuloApi): TallaArticulo => ({
    talla: t.talla,
    descripcion: t.descripcion,
    grupo: t.grupo ?? "",
    orden: t.orden ?? null,
    barcode: t.barcode ?? "",
    color: t.color ?? "",
});

const tallaLineaDesdeApi = (t: TallaLineaApi): TallaLinea => ({
    ...tallaArticuloDesdeApi(t),
    cantidad: t.cantidad,
});

const lineaDesdeApi = (l: LineaApi): LineaPlanProduccion => ({
    id: l.id,
    referencia: l.referencia,
    descripcion: l.descripcion,
    proveedorId: l.proveedor_id,
    nombreProveedor: l.nombre_proveedor,
    almacenId: l.almacen_id,
    nombreAlmacen: l.nombre_almacen,
    fechaEntrega: l.fecha_entrega,
    tallas: l.tallas.map(tallaLineaDesdeApi),
});

export const itemPlanDesdeApi = (p: ItemPlanApi): ItemPlanProduccion => ({
    id: p.id,
    descripcion: p.descripcion,
    fecha: p.fecha,
    fechaSolicitada: p.fecha_solicitada,
    fechaProveedor: p.fecha_proveedor,
    estado: p.estado,
    cantidad: p.cantidad,
});

export const planDesdeApi = (p: PlanApi): PlanProduccion => {
    const cabecera: CabeceraPlanProduccion = {
        ...itemPlanDesdeApi(p),
        observaciones: p.observaciones ?? "",
        proveedorId: p.proveedor_id,
        nombreProveedor: p.nombre_proveedor,
        almacenId: p.almacen_id,
        nombreAlmacen: p.nombre_almacen,
        fechaEntrega: p.fecha_entrega,
    };
    return { cabecera, lineas: p.lineas.map(lineaDesdeApi) };
};

const articuloDesdeApi = (a: ArticuloTallasApi): ArticuloTallas => ({
    referencia: a.referencia,
    descripcion: a.descripcion,
    tallas: a.tallas.map(tallaArticuloDesdeApi),
});

const nuloSiVacio = (v: string | null | undefined) => (v ? v : null);

const cambiosAApi = (c: CambiosPlanProduccion): Record<string, unknown> => {
    const api: Record<string, unknown> = {};
    if (c.descripcion !== undefined) api.descripcion = c.descripcion;
    if (c.fecha !== undefined) api.fecha = c.fecha;
    if (c.fechaSolicitada !== undefined) api.fecha_solicitada = nuloSiVacio(c.fechaSolicitada);
    if (c.fechaProveedor !== undefined) api.fecha_proveedor = nuloSiVacio(c.fechaProveedor);
    if (c.estado !== undefined) api.estado = c.estado;
    if (c.observaciones !== undefined) api.observaciones = c.observaciones;
    if (c.proveedorId !== undefined) api.proveedor_id = nuloSiVacio(c.proveedorId);
    if (c.almacenId !== undefined) api.almacen_id = nuloSiVacio(c.almacenId);
    if (c.fechaEntrega !== undefined) api.fecha_entrega = nuloSiVacio(c.fechaEntrega);
    return api;
};

/** Convierte la rejilla al cuerpo de `PATCH /lineas` (solo tallas con cantidad > 0). */
export const lineasAApi = (lineas: LineaPlanProduccion[]) => ({
    lineas: lineas.map((l) => ({
        ...(l.id ? { id: l.id } : {}),
        referencia: l.referencia,
        descripcion: l.descripcion,
        ...(l.proveedorId ? { proveedor_id: l.proveedorId } : {}),
        ...(l.almacenId ? { almacen_id: l.almacenId } : {}),
        ...(l.fechaEntrega ? { fecha_entrega: l.fechaEntrega } : {}),
        cantidades: Object.fromEntries(
            l.tallas.filter((t) => t.cantidad > 0).map((t) => [t.talla, t.cantidad])
        ),
    })),
});

export const getPlanProduccion: GetPlanProduccion = async (id) => {
    const r = await RestAPI.get<{ datos: PlanApi }>(`${baseUrl}/${id}`);
    return planDesdeApi(r.datos);
};

export const getPlanesProduccion: GetPlanesProduccion = async (criteria) => {
    const q = criteriaQuery(criteria.filtro, criteria.orden, criteria.paginacion);
    const r = await RestAPI.get<{ datos: ItemPlanApi[]; total: number }>(`${baseUrl}${q}`);
    return { datos: r.datos.map(itemPlanDesdeApi), total: r.total };
};

export const postPlanProduccion: PostPlanProduccion = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        {
            id: nuevo.id,
            descripcion: nuevo.descripcion,
            fecha: nuevo.fecha,
            fecha_solicitada: nuloSiVacio(nuevo.fechaSolicitada),
            fecha_proveedor: nuloSiVacio(nuevo.fechaProveedor),
        },
        "Error al crear el plan de producción"
    );
    return respuesta.id;
};

export const patchPlanProduccion: PatchPlanProduccion = async (id, cambios) => {
    await RestAPI.patch(`${baseUrl}/${id}`, cambiosAApi(cambios), "Error al guardar el plan de producción");
};

export const patchLineasPlanProduccion: PatchLineasPlanProduccion = async (id, lineas) => {
    await RestAPI.patch(`${baseUrl}/${id}/lineas`, lineasAApi(lineas), "Error al guardar la rejilla");
};

export const deletePlanProduccion: DeletePlanProduccion = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar el plan de producción");
};

const REFERENCIAS_POR_PETICION = 100;

export const getTallasArticulo: GetTallasArticulo = async (referencias) => {
    const articulos: ArticuloTallas[] = [];
    for (let i = 0; i < referencias.length; i += REFERENCIAS_POR_PETICION) {
        const lote = referencias.slice(i, i + REFERENCIAS_POR_PETICION);
        const r = await RestAPI.get<{ datos: ArticuloTallasApi[] }>(
            `${urls.TALLA_ARTICULO}?referencias=${encodeURIComponent(lote.join(","))}`
        );
        articulos.push(...r.datos.map(articuloDesdeApi));
    }
    return articulos;
};
