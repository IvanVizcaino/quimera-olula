import { FactoryAuthOlula } from '#/auth/factory.ts';
import { menuAuth } from '#/auth/menu.ts';

// Nadia no usa las claves de API: se quita la opción del menú de Administración
const { "Administración/Claves de API": _clavesApi, ...menuAuthNadia } = menuAuth;

export class FactoryAuthNadia extends FactoryAuthOlula {
    static override menu = menuAuthNadia as typeof menuAuth
}
