import { puede } from "@olula/lib/dominio.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { ElementoMenu, ElementoMenuPadre } from "@olula/lib/menu.ts";
import { usePreferencia } from "@olula/lib/usePreferencia.ts";
import { useContext, useState } from "react";
import { Link, useLocation } from "react-router";
import { QIcono } from "../atomos/qicono.tsx";
import { QInput } from "../atomos/qinput.tsx";
import { useMenuControl } from "../plantilla/useMenuControl";
import "./menu-lateral.css";

export const MenuLateral = () => {
  const menuFactory = useContext(FactoryCtx);
  const rutaActual = useLocation().pathname;
  const [busqueda, setBusqueda] = useState("");
  const { menuAbierto, cerrarMenu } = useMenuControl();
  const [gruposAbiertos, setGruposAbiertos] = usePreferencia<Record<string, boolean>>(
    "menu.lateral.grupos-abiertos",
    {}
  );

  const renderBuscador = () => (
    <div id="buscador">
      <QIcono nombre="buscar" tamaño="sm" />
      <QInput
        nombre="buscador"
        label=""
        condensado
        placeholder="Buscar..."
        valor={busqueda}
        onChange={(v) => setBusqueda(v)}
      />
    </div>
  );

  const renderizaElemento = (elemento: ElementoMenu, filtro: string) => {
    const icono = elemento.icono ? (
      <QIcono nombre={elemento.icono} tamaño="sm" />
    ) : null;
    const cumpleFiltro = elemento.nombre.toLowerCase().includes(filtro);

    // Si tiene regla y no tiene permiso, no mostrar
    if ("regla" in elemento && elemento.regla && !puede(elemento.regla)) {
      return null;
    }

    if ("url" in elemento && elemento.url) {
      if (!cumpleFiltro) return null;

      return (
        <li
          key={elemento.nombre}
          className={rutaActual === elemento.url ? "activo" : ""}
        >
          <Link to={elemento.url} onClick={() => cerrarMenu("lateral")}>
            {icono} {elemento.nombre}
          </Link>
        </li>
      );
    }

    const subelementos = (elemento as ElementoMenuPadre).subelementos
      .map((subelemento) =>
        renderizaElemento(subelemento, cumpleFiltro ? "" : filtro)
      )
      .filter(Boolean);
    if (!subelementos.length) return null;

    const estaAbierto = busqueda ? true : (gruposAbiertos[elemento.nombre] ?? false);

    return (
      <details
        key={elemento.nombre}
        open={estaAbierto}
        onToggle={(e) => {
          if (!busqueda) {
            setGruposAbiertos({
              ...gruposAbiertos,
              [elemento.nombre]: (e.target as HTMLDetailsElement).open,
            });
          }
        }}
      >
        <summary>
          {icono} {elemento.nombre}
        </summary>
        <ul>{subelementos}</ul>
      </details>
    );
  };

  const elementos = menuFactory.menu.map((elemento) =>
    renderizaElemento(elemento, busqueda.toLocaleLowerCase())
  );

  return (
    <menu-lateral className={menuAbierto.lateral ? "activo" : ""}>
      <aside id="menu-principal">
        {renderBuscador()}
        <nav>
          <ul>{elementos}</ul>
        </nav>
      </aside>
    </menu-lateral>
  );
};
