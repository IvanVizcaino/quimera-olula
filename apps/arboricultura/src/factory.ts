import { FactoryAuthOlula } from "#/auth/factory.ts";
import { FactoryComunLegacy } from "./contextos/comun/factory.ts";
import { FactoryVentasLegacy } from "./contextos/ventas/factory.ts";

export class FactoryLegacy {
    Ventas = FactoryVentasLegacy;
    Auth = FactoryAuthOlula;
    Comun = FactoryComunLegacy;
}

export default FactoryLegacy;
