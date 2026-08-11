
import { menuVentas } from "./menu.ts"

export class FactoryVentasLegacy {
    static menu = menuVentas
    // Retorno del modal de albaranar hacia las vistas legacy (rutas en plural).
    static albaranar_url_pedido = (id: string) => `/ventas/pedidos/${id}`
    static albaranar_url_albaran = (id: string) => `/ventas/albaranes/${id}`
}
