import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { FiltroInformeIncidencias, GetInformeIncidencias } from "./diseño.ts";

const baseUrl = "/crm/incidencia-informe";

export const getInformeIncidencias: GetInformeIncidencias = async (filtro: FiltroInformeIncidencias) => {
    const params = new URLSearchParams();
    if (filtro.agenteId) params.set("agente_id", filtro.agenteId);
    if (filtro.fechaDesde) params.set("fecha_desde", filtro.fechaDesde);
    if (filtro.fechaHasta) params.set("fecha_hasta", filtro.fechaHasta);
    if (filtro.estado) params.set("estado", filtro.estado);
    if (filtro.prioridad) params.set("prioridad", filtro.prioridad);
    if (filtro.tipoIncidencia) params.set("tipo_incidencia", filtro.tipoIncidencia);
    if (filtro.categoriaId) params.set("categoria_incidencia", filtro.categoriaId);
    if (filtro.subcategoriaId) params.set("subcategoria_incidencia", filtro.subcategoriaId);
    if (filtro.clienteId) params.set("cliente_id", filtro.clienteId);
    if (filtro.codigoCausante) params.set("codigo_causante", filtro.codigoCausante);
    if (filtro.articuloId) params.set("articulo_id", filtro.articuloId);

    const qs = params.toString();
    const url = qs ? `${baseUrl}?${qs}` : baseUrl;

    return RestAPI.blob(url, "Error al generar el informe de incidencias");
};
