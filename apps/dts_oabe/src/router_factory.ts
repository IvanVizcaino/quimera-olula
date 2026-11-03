import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryCrmOlula } from '#/crm/router_factory.ts';
import { Home } from '@olula/componentes/index.ts';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

export class RouterFactoryDtsOabe {
    Inicio = { router: { "": Home } };
    Auth = RouterFactoryAuthOlula;
    Crm = RouterFactoryCrmOlula;
}

export const router = crearRouter(new RouterFactoryDtsOabe() as unknown as Record<string, { router: RouteObject }>);
