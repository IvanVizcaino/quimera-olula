import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactorySaas } from '#/saas/router_factory.ts';
import { PaginaResumenSaas } from '#/saas/resumen/PaginaResumenSaas.tsx';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

export class RouterFactorySaasAdmin {
    Inicio = { router: { "": PaginaResumenSaas } };
    Auth = RouterFactoryAuthOlula;
    Saas = RouterFactorySaas;
}

export const router = crearRouter(new RouterFactorySaasAdmin() as unknown as Record<string, { router: RouteObject }>);
