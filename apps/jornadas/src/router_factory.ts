import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryRrhhEmpleado } from '#/rrhh_area_empleado/router_factory.ts';
import { Home } from '@olula/componentes/index.ts';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

export class RouterFactoryJornadas {
    Inicio = { router: { "": Home } };
    Auth = RouterFactoryAuthOlula;
    Rrhh = RouterFactoryRrhhEmpleado;
}

export const router = crearRouter(new RouterFactoryJornadas() as unknown as Record<string, { router: RouteObject }>);
