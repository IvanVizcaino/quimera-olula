import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    DeletePeriodoIva,
    GetPeriodoIva,
    GetPeriodosIva,
    NuevoPeriodoIva,
    PatchPeriodoIva,
    PeriodoIva,
    PostPeriodoIva,
} from "./diseño.ts";

const BASE_URL = "/comun/periodo_iva";

interface PeriodoIvaApi {
    id: string;
    impuesto_id: string;
    fecha_desde: string | null;
    fecha_hasta: string | null;
    iva: number;
    recargo: number;
}

const fechaDesdeApi = (valor: string | null | undefined): Date | null =>
    valor ? new Date(valor) : null;

const fechaAApi = (valor: Date | null | undefined): string | null | undefined => {
    if (valor === undefined) return undefined;
    if (valor === null) return null;
    return valor.toISOString().slice(0, 10);
};

export const periodoIvaDesdeApi = (api: PeriodoIvaApi): PeriodoIva => ({
    id: api.id,
    impuestoId: api.impuesto_id,
    fechaDesde: fechaDesdeApi(api.fecha_desde),
    fechaHasta: fechaDesdeApi(api.fecha_hasta),
    iva: api.iva,
    recargo: api.recargo,
});

const periodoIvaAApi = (cambios: Partial<PeriodoIva>): Record<string, unknown> => {
    const api: Record<string, unknown> = {};
    if (cambios.fechaDesde !== undefined) api.fecha_desde = fechaAApi(cambios.fechaDesde);
    if (cambios.fechaHasta !== undefined) api.fecha_hasta = fechaAApi(cambios.fechaHasta);
    if (cambios.iva !== undefined) api.iva = cambios.iva;
    if (cambios.recargo !== undefined) api.recargo = cambios.recargo;
    return api;
};

export const getPeriodoIva: GetPeriodoIva = async (id) =>
    RestAPI.getItem<PeriodoIva, PeriodoIvaApi>(`${BASE_URL}/${id}`, periodoIvaDesdeApi);

export const getPeriodosIva: GetPeriodosIva = async (criteria) =>
    RestAPI.getQuery<PeriodoIva, PeriodoIvaApi>(BASE_URL, criteria, periodoIvaDesdeApi);

export const postPeriodoIva: PostPeriodoIva = async (nuevo: NuevoPeriodoIva) => {
    const body: Record<string, unknown> = {
        impuesto_id: nuevo.impuestoId,
        iva: nuevo.iva,
        recargo: nuevo.recargo,
    };
    const fd = fechaAApi(nuevo.fechaDesde ?? null);
    const fh = fechaAApi(nuevo.fechaHasta ?? null);
    if (fd) body.fecha_desde = fd;
    if (fh) body.fecha_hasta = fh;

    const respuesta = await RestAPI.post(BASE_URL, body, "Error al crear periodo de IVA");
    return respuesta.id;
};

export const patchPeriodoIva: PatchPeriodoIva = async (id, cambios) => {
    await RestAPI.patch(`${BASE_URL}/${id}`, periodoIvaAApi(cambios), "Error al actualizar periodo de IVA");
};

export const deletePeriodoIva: DeletePeriodoIva = async (id) => {
    await RestAPI.delete(`${BASE_URL}/${id}`, "Error al borrar periodo de IVA");
};

/** Exportado para tests de mapeo API ↔ dominio. */
export const periodoIvaDesdeApiParaTest = periodoIvaDesdeApi;
export const periodoIvaAApiParaTest = periodoIvaAApi;
