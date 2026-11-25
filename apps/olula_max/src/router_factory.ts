import { crearRouter } from "@olula/lib/router.ts";
import { RouterFactoryOlula } from "@olula/olula/router_factory.ts";
import { RouteObject } from "react-router";

/** Rutas de olula_max: todas las de olula (ver factory.ts). */
export class RouterFactoryOlulaMax extends RouterFactoryOlula { }

export const router = crearRouter(new RouterFactoryOlulaMax() as unknown as Record<string, { router: RouteObject }>);
