import { FactoryAuthOlula } from '#/auth/factory.ts';
import { FactoryAlmacenCremaCafe } from './contextos/almacen/factory.ts';
import { FactoryComprasCremaCafe } from './contextos/compras/factory.ts';
import { FactoryTesoreriaCremaCafe } from './contextos/tesoreria/factory.ts';
import { FactoryContabilidadCremaCafe } from './contextos/contabilidad/factory.ts';
import { FactoryTpvCremaCafe } from './contextos/tpv/factory.ts';
import { FactoryVentasCremaCafe } from './contextos/ventas/factory.ts';

export class FactoryCremaCafe {
    Auth = FactoryAuthOlula;
    Ventas = FactoryVentasCremaCafe;
    Compras = FactoryComprasCremaCafe;
    Almacen = FactoryAlmacenCremaCafe;
    Tesoreria = FactoryTesoreriaCremaCafe;
    TPV = FactoryTpvCremaCafe;
    Contabilidad = FactoryContabilidadCremaCafe;
}

export default FactoryCremaCafe;
