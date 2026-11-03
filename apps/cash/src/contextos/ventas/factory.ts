
import { menuVentas } from "./menu.ts"

export class FactoryVentasLegacy {
    static menu = menuVentas
    static albaranar_url_pedido = (id: string) => `/ventas/pedidos/${id}`
    static albaranar_url_albaran = (id: string) => `/ventas/albaranes/${id}`
    static presupuesto_url_presupuesto = (id: string) => `/ventas/presupuestos/${id}`
    static presupuesto_url_pedido = (id: string) => `/ventas/pedidos/${id}`
}
