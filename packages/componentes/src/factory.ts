import { MenuUsuarioBase } from "./menu/menu-usuario.tsx";
import { CabeceraBase } from "./plantilla/Cabecera.tsx";

export class FactoryComponentesOlula {
    static Cabecera = CabeceraBase;
    static MenuUsuario = MenuUsuarioBase;
}