import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryProyectosOlula } from '#/proyectos/router_factory.ts';
import { RouterFactoryRrhh } from '#/rrhh/router_factory.ts';
import { RouterFactoryRrhhEmpleado } from '#/rrhh_area_empleado/router_factory.ts';
import { RouterFactoryTesoreriaOlula } from '#/tesoreria/router_factory.ts';
import { FondoInicio } from '@olula/componentes/plantilla/FondoInicio.tsx';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

export class RouterFactoryYeboyebo {
    Inicio = { router: { "": FondoInicio } };
    Auth = RouterFactoryAuthOlula;
    Rrhh = RouterFactoryRrhh;
    RrhhAreaEmpleado = RouterFactoryRrhhEmpleado;
    Proyectos = RouterFactoryProyectosOlula;
    Tesoreria = RouterFactoryTesoreriaOlula;
}

export const router = crearRouter(new RouterFactoryYeboyebo() as unknown as Record<string, { router: RouteObject }>);
