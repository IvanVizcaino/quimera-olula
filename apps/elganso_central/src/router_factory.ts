import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { FondoInicio } from '@olula/componentes/plantilla/FondoInicio.tsx';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';
import { RouterFactoryAlmacenCentral } from './contextos/almacen/router_factory.ts';

export class RouterFactoryElGansoCentral {
    Inicio = { router: { "": FondoInicio } };
    Auth = RouterFactoryAuthOlula;
    Almacen = RouterFactoryAlmacenCentral;
}

export const router = crearRouter(new RouterFactoryElGansoCentral() as unknown as Record<string, { router: RouteObject }>);
