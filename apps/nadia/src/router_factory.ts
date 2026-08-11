import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryTpvOlula } from '#/tpv/router_factory.ts';
import { FondoInicio } from '@olula/componentes/plantilla/FondoInicio.tsx';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';
import { RouterFactoryAlmacenNad } from './contextos/almacen/router_factory.ts';
import { RouterFactoryVentasNad } from './contextos/ventas/router_factory.ts';

export class RouterFactoryNadia {
    Inicio = { router: { "": FondoInicio } };
    Auth = RouterFactoryAuthOlula;
    Tpv = RouterFactoryTpvOlula;
    Almacen = RouterFactoryAlmacenNad;
    Ventas = RouterFactoryVentasNad;
}

export const router = crearRouter(new RouterFactoryNadia() as unknown as Record<string, { router: RouteObject }>);
