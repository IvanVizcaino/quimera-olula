import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryTenancy } from '#/tenancy/router_factory.ts';
import { Home } from '@olula/componentes/index.ts';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

export class RouterFactoryJornadasAdmin {
    Inicio = { router: { "": Home } };
    Auth = RouterFactoryAuthOlula;
    Tenancy = RouterFactoryTenancy;
}

export const router = crearRouter(new RouterFactoryJornadasAdmin() as unknown as Record<string, { router: RouteObject }>);
