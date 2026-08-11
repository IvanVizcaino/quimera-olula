import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { FondoInicio } from '@olula/componentes/plantilla/FondoInicio.tsx';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';
import { RouterFactoryEventosAlma } from './contextos/eventos/router_factory.ts';

export class RouterFactoryAlmaEventos {
    Inicio = { router: { "": FondoInicio } };
    Eventos = RouterFactoryEventosAlma;
    Auth = RouterFactoryAuthOlula;
};

export const router = crearRouter(new RouterFactoryAlmaEventos() as unknown as Record<string, { router: RouteObject }>);