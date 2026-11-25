import { FactoryVentasOlula } from "#/ventas/factory.ts";
import { menuVentas } from "./menu.ts";

export class FactoryVentasDtsOabe extends FactoryVentasOlula {
    static menu = menuVentas;
}
