import { MiddlewareFunction, redirect } from "react-router";
import { comprobarToken } from "./login/dominio.ts";

export const authMiddleware: MiddlewareFunction = async ({ request }, next) => {
    const url = new URL(request.url);

    const rutasPublicas = ["/login", "/auth/passkey/enlace-magico", "/auth/reset-password"];
    if (rutasPublicas.includes(url.pathname)) return;

    await comprobarToken().catch((_e) => {
        throw redirect("/login")
    })

    return await next();
}