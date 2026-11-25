import { menuAuth } from "./menu.ts"

export class FactoryAuthOlula {
    static menu = menuAuth
    static formato_login = "email"
    /** Punto de extensión opcional: enlace del login hacia el alta de cuenta (solo las apps que lo definan). */
    static enlace_registro?: { pregunta?: string; texto: string; url: string }
}
