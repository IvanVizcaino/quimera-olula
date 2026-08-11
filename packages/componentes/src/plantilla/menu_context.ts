import { createContext } from "react";

export type MenuType = "lateral" | "usuario";

export interface MenuContextType {
    menuAbierto: Record<MenuType, boolean>;
    abrirMenu: (menu: MenuType) => void;
    cerrarMenu: (menu: MenuType) => void;
    toggleMenu: (menu: MenuType) => void;
    cerrarTodos: () => void;
}

export const MenuContext = createContext<MenuContextType | undefined>(
    undefined
);