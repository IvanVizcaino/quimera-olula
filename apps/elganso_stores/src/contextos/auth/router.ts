import { routerAuth as routerAuthDefault } from "#/auth/router.ts";
import { Login } from "./login/vistas/Login.tsx";

export const routerAuth = {
    ...routerAuthDefault,
    login: Login,
};

export class RouterFactoryAuthOlula {
    static router = routerAuth;
}
