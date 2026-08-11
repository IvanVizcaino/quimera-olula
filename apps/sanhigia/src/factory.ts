import { CabeceraSanhigia } from "./componentes/CabeceraSanhigia";
import { ExtraLogoSanhigia } from "./componentes/ExtraLogoSanhigia";
import { MenuUsuarioSanhigia } from "./componentes/MenuUsuarioSanhigia";
import { FactoryAlmacenLegacy } from "./contextos/almacen/factory.ts";
import { FactoryAuthSanhigia } from "./contextos/auth/factory.ts";
import { FactoryInformesLegacy } from "./contextos/informes/factory.ts";
import { MenuUsuarioElementosSanhigia } from "./contextos/menu";
import { procesarElementosSanhigia } from "./contextos/procesarMenuUsuario";
import { FactorySmartsalesLegacy } from "./contextos/smartsales/factory.ts";
import { FactoryVentasLegacy } from "./contextos/ventas/factory.ts";

class FactoryComponentesSanhigia {
    static cabecera = CabeceraSanhigia;
    static cabecera_menu_usuario = MenuUsuarioSanhigia;
    static cabecera_extra_logo = ExtraLogoSanhigia;
    static menu_usuario_elementos = MenuUsuarioElementosSanhigia;
    static menu_usuario_procesar_elementos = procesarElementosSanhigia;
    static pie = () => null; // elimina el footer
}


export class FactoryLegacy {
    Almacen = FactoryAlmacenLegacy;
    Ventas = FactoryVentasLegacy;
    Informes = FactoryInformesLegacy;
    Smartsales = FactorySmartsalesLegacy;
    Auth = FactoryAuthSanhigia;
    Componentes = FactoryComponentesSanhigia;
}

export default FactoryLegacy;