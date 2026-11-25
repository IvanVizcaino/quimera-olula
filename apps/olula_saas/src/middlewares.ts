import { authMiddleware } from "#/auth/middlewares.ts";
import { RUTAS_PUBLICAS_REGISTRO } from "#/saas_registro/router_factory.ts";
import { destinoSinSesion } from "#/saas_registro/landing/dominio.ts";
import { moduloBloqueadoEnUrl } from "@olula/lib/dominio.ts";
import { MiddlewareFunction, redirect } from "react-router";

/**
 * El de auth, dejando pasar sin sesión la landing y las páginas públicas del registro; la raíz sin sesión
 * lleva a la landing en lugar de al login. Una URL
 * de un módulo no contratado (escrita a mano o de un marcador) vuelve al inicio:
 * el menú ya no la ofrece y la API la rechazaría con 403.
 */
export const authMiddlewareSaas: MiddlewareFunction = async (args, next) => {
    const ruta = new URL(args.request.url).pathname;
    if (RUTAS_PUBLICAS_REGISTRO.includes(ruta)) return await next();
    if (moduloBloqueadoEnUrl(ruta)) throw redirect("/");
    try {
        return await authMiddleware(args, next);
    } catch (e) {
        // Sin sesión, la raíz muestra la landing; el resto de rutas siguen yendo al login.
        if (e instanceof Response && e.headers.has("Location")) {
            const destino = e.headers.get("Location") ?? "";
            const nuevo = destinoSinSesion(ruta, destino);
            if (nuevo !== destino) throw redirect(nuevo);
        }
        throw e;
    }
};
