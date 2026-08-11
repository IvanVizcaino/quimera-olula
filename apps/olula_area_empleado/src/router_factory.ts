import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryRrhhEmpleado } from '#/rrhh_area_empleado/router_factory.ts';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

export class RouterFactoryAreaEmpleados {
    Auth = RouterFactoryAuthOlula;
    Rrhh = RouterFactoryRrhhEmpleado;
}

export const router = crearRouter(new RouterFactoryAreaEmpleados() as unknown as Record<string, { router: RouteObject }>);
