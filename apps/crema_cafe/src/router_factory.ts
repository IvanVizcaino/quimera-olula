import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { Home } from '@olula/componentes/home/Home.tsx';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';
import { RouterFactoryAlmacenCremaCafe } from './contextos/almacen/router_factory.ts';
import { RouterFactoryComprasCremaCafe } from './contextos/compras/router_factory.ts';
import { RouterFactoryTesoreriaCremaCafe } from './contextos/tesoreria/router_factory.ts';
import { RouterFactoryContabilidadCremaCafe } from './contextos/contabilidad/router_factory.ts';
import { RouterFactoryTpvCremaCafe } from './contextos/tpv/router_factory.ts';
import { RouterFactoryVentasCremaCafe } from './contextos/ventas/router_factory.ts';
import { RouterFactoryComunCremaCafe } from './contextos/comun/router_factory.ts';

export class RouterFactoryCremaCafe {
    Inicio = { router: { "": Home } };
    Auth = RouterFactoryAuthOlula;
    Ventas = RouterFactoryVentasCremaCafe;
    Compras = RouterFactoryComprasCremaCafe;
    Almacen = RouterFactoryAlmacenCremaCafe;
    Tesoreria = RouterFactoryTesoreriaCremaCafe;
    Tpv = RouterFactoryTpvCremaCafe;
    Contabilidad = RouterFactoryContabilidadCremaCafe;
    Comun = RouterFactoryComunCremaCafe;
}

export const router = crearRouter(new RouterFactoryCremaCafe() as unknown as Record<string, { router: RouteObject }>);
