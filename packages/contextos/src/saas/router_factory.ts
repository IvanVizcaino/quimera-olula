import { MaestroConDetalleCredencialExterna } from "../comun/credencial_externa/maestro/MaestroConDetalleCredencialExterna.tsx";
import { PantallaCatalogo } from "./catalogo/maestro/PantallaCatalogo.js";
import { PantallaPasarelas } from "./pasarela/maestro/PantallaPasarelas.js";
import { MaestroConDetallePlan } from "./plan/maestro/MaestroConDetallePlan.js";
import { MaestroConDetalleTenant } from "./tenant/maestro/MaestroConDetalleTenant.js";

export class RouterFactorySaas {
    static router = {
        "saas/empresas": MaestroConDetalleTenant,
        "saas/planes": MaestroConDetallePlan,
        "saas/catalogo": PantallaCatalogo,
        "saas/pasarelas": PantallaPasarelas,
        "comun/credencial-externa": MaestroConDetalleCredencialExterna,
        "comun/credencial-externa/:id": MaestroConDetalleCredencialExterna,
    };
}
