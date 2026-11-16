import { RouterFactoryAuthOlula } from "#/auth/router_factory.ts";
import { crearRouter } from "@olula/lib/router.ts";
import { RouteObject } from "react-router";
import { RouterFactoryProduccionMonterelax } from "./contextos/produccion/router_factory.ts";

export class RouterFactoryLegacy {
    Auth = RouterFactoryAuthOlula;
    Produccion = RouterFactoryProduccionMonterelax;
}

export const router = crearRouter(new RouterFactoryLegacy() as unknown as Record<string, { router: RouteObject }>);
