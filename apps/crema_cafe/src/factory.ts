import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { FactoryVentasCremaCafe } from './contextos/ventas/factory.ts';

export class FactoryCremaCafe {
    Auth = FactoryAuthOlula;
    Ventas = FactoryVentasCremaCafe;
    TPV = FactoryTpvOlula;
}

export default FactoryCremaCafe;
