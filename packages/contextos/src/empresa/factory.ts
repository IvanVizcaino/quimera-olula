import { menuEmpresa } from "./menu.ts";

export class FactoryEmpresaOlula {
    static menu: Record<string, { icono?: string; url?: string; regla?: string }> = menuEmpresa;
}
