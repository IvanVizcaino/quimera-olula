import { RouterFactoryAuthOlula } from "#/auth/router_factory.ts";
import { RouterFactoryVentasOlula } from "#/ventas/router_factory.ts";
import { crearRouter } from "@olula/lib/router.ts";
import { RouteObject } from "react-router";


// export class RouterFactoryLegacy extends RouterFactoryOlula {
//     Inicio = undefined;
//     Crm = undefined;
// }
export class RouterFactoryLegacy {
    Ventas = RouterFactoryVentasOlula;
    Auth = RouterFactoryAuthOlula;
}

export const router = crearRouter(new RouterFactoryLegacy() as unknown as Record<string, { router: RouteObject }>);
