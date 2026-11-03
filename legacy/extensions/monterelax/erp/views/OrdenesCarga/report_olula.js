import { RestAPI } from "@olula/lib/api/rest_api.ts";

const baseUrl = "/produccion/orden_carga";

export const getReportAlbaranesOrdenCarga = idOrden =>
  RestAPI.blob(
    `${baseUrl}/${idOrden}/albaranes/report`,
    "Error al obtener los albaranes de la orden de carga"
  );

export const terminarOrdenCarga = idOrden =>
  RestAPI.patch(
    `${baseUrl}/${idOrden}/terminar`,
    {},
    "Error al marcar la orden de carga como terminada"
  );
