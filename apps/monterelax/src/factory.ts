import { FactoryAuthOlula } from "#/auth/factory.ts";
import { FactoryErpLegacy } from "./contextos/erp/factory.ts";

export class FactoryLegacy {
    Erp = FactoryErpLegacy;
    Auth = FactoryAuthOlula;
}

export default FactoryLegacy;
