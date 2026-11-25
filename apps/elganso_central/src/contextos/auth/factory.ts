import { FactoryAuthOlula } from '#/auth/factory.ts';
import { menuAuth } from '#/auth/menu.ts';

// Central no usa las claves de API: se quita la opción del menú de Administración
const { "Administración/Claves de API": _clavesApi, ...menuAuthCentral } = menuAuth;

export class FactoryAuthCentral extends FactoryAuthOlula {
    static override menu = menuAuthCentral as typeof menuAuth
}
