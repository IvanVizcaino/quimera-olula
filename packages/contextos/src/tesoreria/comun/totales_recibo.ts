import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaAQueryString } from "@olula/lib/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";

/** Totales agregados del listado filtrado (CC-08). */
export interface TotalesReciboListado {
    importeTotal: number;
    importePagado: number;
    importePendiente: number;
}

export interface TotalesReciboListadoApi {
    importe_total: number;
    importe_pagado: number;
    importe_pendiente: number;
}

export const totalesReciboListadoDesdeApi = (
    api: TotalesReciboListadoApi
): TotalesReciboListado => ({
    importeTotal: api.importe_total,
    importePagado: api.importe_pagado,
    importePendiente: api.importe_pendiente,
});

export const getTotalesReciboListado = async (
    urlBase: string,
    criteria: Criteria,
    msgError: string
): Promise<TotalesReciboListado> => {
    const q = criteriaAQueryString(criteria);
    return RestAPI.getItem(
        `${urlBase}/totales${q}`,
        totalesReciboListadoDesdeApi,
        msgError
    );
};
