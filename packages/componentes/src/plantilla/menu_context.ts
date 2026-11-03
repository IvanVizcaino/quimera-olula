import { createContext } from "react";

export type MenuType = "lateral" | "usuario";

export interface MenuContextType {
    menuAbierto: Record<MenuType, boolean>;
    abrirMenu: (menu: MenuType) => void;
    cerrarMenu: (menu: MenuType) => void;
    toggleMenu: (menu: MenuType) => void;
    cerrarTodos: () => void;
    /** Escritorio: menú lateral ancho (true) o carril de iconos (false). Se recuerda. */
    lateralExpandido: boolean;
    alternarLateralExpandido: () => void;
    /** Urls marcadas como favoritas y últimas visitadas (por usuario). */
    favoritos: string[];
    alternarFavorito: (url: string) => void;
    recientes: string[];
    /** Se incrementa para volver a montar la pantalla actual (p. ej. la búsqueda
     *  abre otro documento en la misma ruta: el maestro solo lee el id al montarse). */
    versionPantalla: number;
    /** Llamar ANTES de navegar: vuelve a montar la pantalla tras la próxima navegación. */
    recargarPantalla: () => void;
    /** Búsqueda rápida (Ctrl K). */
    busquedaAbierta: boolean;
    abrirBusqueda: () => void;
    cerrarBusqueda: () => void;
}

export const MenuContext = createContext<MenuContextType | undefined>(
    undefined
);
