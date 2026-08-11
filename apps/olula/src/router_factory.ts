import { RouterFactoryAlmacenOlula } from '#/almacen/router_factory.ts';
import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryComunOlula } from "#/comun/router_factory.ts";
import { RouterFactoryCrmOlula } from '#/crm/router_factory.ts';
import { RouterFactoryEmpresaOlula } from '#/empresa/router_factory.ts';
import { RouterFactoryPrediccionesOlula } from '#/predicciones/router_factory.ts';
import { RouterFactoryRrhh } from '#/rrhh/router_factory.ts';
import { RouterFactoryTpvOlula } from '#/tpv/router_factory.ts';
import { RouterFactoryVentasOlula } from '#/ventas/router_factory.ts';
import { Historias, Home } from '@olula/componentes/index.ts';
// import { FondoInicio } from '@olula/componentes/plantilla/FondoInicio.tsx';

import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

export class RouterFactoryOlula {
    Inicio = { router: { "": Home } };
    Auth = RouterFactoryAuthOlula;
    Ventas = RouterFactoryVentasOlula;
    Almacen = RouterFactoryAlmacenOlula;
    Crm = RouterFactoryCrmOlula;
    Empresa = RouterFactoryEmpresaOlula;
    Tpv = RouterFactoryTpvOlula;
    Predicciones = RouterFactoryPrediccionesOlula;
    Comun = RouterFactoryComunOlula;
    Rrhh = RouterFactoryRrhh;
    Otros = {
        router: {
            "docs/componentes": Historias
        }
    }
}

export const router = crearRouter(new RouterFactoryOlula() as unknown as Record<string, { router: RouteObject }>);