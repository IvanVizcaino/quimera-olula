import { MaestroConDetallePlanProduccion } from "./plan_produccion/maestro/MaestroConDetallePlanProduccion.tsx";

export class RouterFactoryAlmacenCentral {
    static router = {
        "almacen/plan_produccion": MaestroConDetallePlanProduccion,
    };
}
