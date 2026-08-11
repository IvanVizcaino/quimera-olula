import { LineaPedidoAPI, postLinea } from "#/ventas/pedido/infraestructura.ts";
import { LineaPedidoNrj } from "./diseño.ts";

interface PaletLineaPedidoApiNrj {
    id: string
    cantidad_envases: number
}
export interface LineaPedidoApiNrj extends LineaPedidoAPI {
    variedad_id: string
    marca_id: string
    calibre_id: string
    tipo_palet_id: string
    envase_id: string
    categoria: string
    variedad: string
    marca: string
    calibre: string
    palet: string
    envase: string
    cantidad_envases_asignados: number
    cantidad_envases_nominal: number
    num_palets: number
    cantidad_envases: number
    envases_por_palet: number
    observaciones: string
    palets: PaletLineaPedidoApiNrj[]
}

const lineaPedidoDesdeApi = (l: LineaPedidoApiNrj): LineaPedidoNrj => {
    return {
        ...l,
        idVariedad: l.variedad_id,
        descVariedad: l.variedad,
        idCalibre: l.calibre_id,
        descCalibre: l.calibre,
        idMarca: l.marca_id,
        descMarca: l.marca,
        idTipoPalet: l.tipo_palet_id,
        cantidadPalets: l.num_palets,
        cantidadEnvases: l.cantidad_envases,
        envasesPorPalet: l.envases_por_palet,
        descPalet: l.palet,
        idEnvase: l.envase_id,
        descEnvase: l.envase,
        categoria: l.categoria,
        categoriaFormateada: l.categoria + "ª",
        cantidadPalet: l.num_palets,
        iva_incluido: l.iva_incluido,

        observaciones: l.observaciones,
        cantidadEnvasesAsignados: l.cantidad_envases_asignados,
        palets: l.palets.map(p => ({
            id: p.id,
            cantidadEnvases: p.cantidad_envases
        }))
    }
};

export const ventasPedidoInfra = {
    linea_desde_api: lineaPedidoDesdeApi,
    postLinea: postLinea
}