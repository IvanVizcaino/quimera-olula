import { usePreferencia } from "@olula/lib/usePreferencia.ts";
import { anotarReciente } from "../menu/dominio.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { MenuContext, MenuContextType, MenuType } from "./menu_context";

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [menuAbierto, setMenuAbierto] = useState<Record<MenuType, boolean>>({
    lateral: false,
    usuario: false,
  });
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [versionPantalla, setVersionPantalla] = useState(0);
  // La recarga espera a que el router haya aplicado la nueva URL: si el contenido
  // se monta antes, el maestro lee el id antiguo.
  const recargaPendiente = useRef(false);
  // Por defecto el carril de iconos: el contenido conserva casi todo el ancho.
  const [lateralExpandido, setLateralExpandido] = usePreferencia(
    "menu.lateral.expandido",
    false
  );
  const [favoritos, setFavoritos] = usePreferencia<string[]>(
    "menu.favoritos",
    []
  );
  const [recientes, setRecientes] = usePreferencia<string[]>(
    "menu.recientes",
    []
  );

  const location = useLocation();

  const cerrarTodos = useCallback(() => {
    setMenuAbierto({ lateral: false, usuario: false });
  }, []);

  // Cerrar menús automáticamente al navegar
  useEffect(() => {
    cerrarTodos();
    setBusquedaAbierta(false);
  }, [cerrarTodos, location.pathname]);

  useEffect(() => {
    if (!recargaPendiente.current) return;
    recargaPendiente.current = false;
    setVersionPantalla((v) => v + 1);
  }, [location.key]);

  // Ctrl/Cmd + K abre la búsqueda rápida desde cualquier pantalla.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBusquedaAbierta(true);
      }
    };
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, []);

  const abrirMenu = useCallback((menu: MenuType) => {
    setMenuAbierto((prev) => ({ ...prev, [menu]: true }));
  }, []);

  const cerrarMenu = useCallback((menu: MenuType) => {
    setMenuAbierto((prev) => ({ ...prev, [menu]: false }));
  }, []);

  const toggleMenu = useCallback((menu: MenuType) => {
    setMenuAbierto((prev) => ({ ...prev, [menu]: !prev[menu] }));
  }, []);

  const value: MenuContextType = {
    menuAbierto,
    abrirMenu,
    cerrarMenu,
    toggleMenu,
    cerrarTodos,
    lateralExpandido,
    alternarLateralExpandido: () => setLateralExpandido(!lateralExpandido),
    favoritos,
    alternarFavorito: (url) =>
      setFavoritos(
        favoritos.includes(url)
          ? favoritos.filter((f) => f !== url)
          : [...favoritos, url]
      ),
    recientes,
    versionPantalla,
    recargarPantalla: () => {
      recargaPendiente.current = true;
    },
    busquedaAbierta,
    abrirBusqueda: () => setBusquedaAbierta(true),
    cerrarBusqueda: () => setBusquedaAbierta(false),
  };

  // Recientes: se anotan aquí (siempre montado) y no en el menú, que en móvil
  // puede no estar visible. Solo las urls del menú, las resuelve MenuLateral.
  return (
    <MenuContext.Provider value={value}>
      <RegistroRecientes recientes={recientes} setRecientes={setRecientes} />
      {children}
    </MenuContext.Provider>
  );
};

/** Anota la ruta actual en recientes; el menú filtra luego las que son pantallas. */
const RegistroRecientes = ({
  recientes,
  setRecientes,
}: {
  recientes: string[];
  setRecientes: (v: string[]) => void;
}) => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (recientes[0] === pathname) return;
    setRecientes(anotarReciente(recientes, pathname, 20));
    // Solo al cambiar de ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
};
