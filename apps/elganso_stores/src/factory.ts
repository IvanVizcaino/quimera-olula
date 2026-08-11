import { FactoryComponentesOlula } from "@olula/componentes/factory.js";
import { CabeceraGanso } from "./componentes/Cabecera/Cabecera.tsx";
import { MenuUsuarioGan } from "./componentes/MenuUsuario/MenuUsuario.tsx";
import { FactoryAlmacenLegacy } from "./contextos/almacen/factory.ts";
import { FactoryAuthLegacy } from "./contextos/auth/factory.ts";
import { MenuUsuarioElementosGanso } from "./contextos/menu/menu.ts";
import { FactoryVentasLegacy } from "./contextos/ventas/factory.ts";

class FactoryComponentesGan extends FactoryComponentesOlula {
    static cabecera = CabeceraGanso;
    static cabecera_menu_usuario = MenuUsuarioGan;
    static menu_usuario_elementos = MenuUsuarioElementosGanso;
}

export class FactoryLegacy {
    Ventas = FactoryVentasLegacy;
    Almacen = FactoryAlmacenLegacy;
    Auth = FactoryAuthLegacy;
    Componentes = FactoryComponentesGan;
}

export default FactoryLegacy;