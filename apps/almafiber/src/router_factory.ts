import { RouterFactoryAlmacenOlula } from '#/almacen/router_factory.ts';
import { RouterFactoryAuthOlula } from '#/auth/router_factory.ts';
import { RouterFactoryComprasOlula } from '#/compras/router_factory.ts';
import { RouterFactoryComunOlula } from '#/comun/router_factory.ts';
import { PaginaInicio } from '#/comun/dashboard/vistas/pagina/PaginaDashboard.tsx';
import { RouterFactoryContabilidadOlula } from '#/contabilidad/router_factory.ts';
import { RouterFactoryEmpresaOlula } from '#/empresa/router_factory.ts';
import { RouterFactoryFiscalOlula } from '#/fiscal/router_factory.ts';
import { RouterFactoryTesoreriaOlula } from '#/tesoreria/router_factory.ts';
import { RouterFactoryVentasOlula } from '#/ventas/router_factory.ts';
import { crearRouter } from '@olula/lib/router.ts';
import { RouteObject } from 'react-router';

/** Rutas de los módulos que almafiber hereda de olula (ver factory.ts). */
export class RouterFactoryAlmafiber {
    Inicio = { router: { "": PaginaInicio } };
    Auth = RouterFactoryAuthOlula;
    Ventas = RouterFactoryVentasOlula;
    Almacen = RouterFactoryAlmacenOlula;
    Compras = RouterFactoryComprasOlula;
    Contabilidad = RouterFactoryContabilidadOlula;
    Fiscal = RouterFactoryFiscalOlula;
    Tesoreria = RouterFactoryTesoreriaOlula;
    Empresa = RouterFactoryEmpresaOlula;
    Comun = RouterFactoryComunOlula;
}

export const router = crearRouter(new RouterFactoryAlmafiber() as unknown as Record<string, { router: RouteObject }>);
