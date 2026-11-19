import { REGLA_ASISTENTE, puede } from "@olula/lib/dominio.ts";
import { PropsWithChildren, useContext } from "react";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { BusquedaRapida } from "../menu/busqueda-rapida.tsx";
import { MenuLateral } from "../menu/menu-lateral.tsx";
import { MenuUsuario } from "../menu/menu-usuario.tsx";
import { Slot } from "../slot/Slot.tsx";
import { Cabecera } from "./Cabecera.tsx";
import { MenuProvider } from "./MenuContext.tsx";
import { Pie } from "./Pie.tsx";
import "./Plantilla.css";
import { SseSesionGlobal } from "./SseSesionGlobal.tsx";
import { useMenuControl } from "./useMenuControl.ts";

/** Contenido de la pantalla; `versionPantalla` lo vuelve a montar a petición. */
const ContenidoPantalla = ({ hijos }: { hijos: React.ReactNode }) => (
  <Slot key={useMenuControl().versionPantalla} hijos={hijos} />
);

/** La búsqueda rápida (Ctrl K) se monta solo mientras está abierta. */
const BusquedaRapidaGlobal = () =>
  useMenuControl().busquedaAbierta ? <BusquedaRapida /> : null;

export const Plantilla = ({ children }: PropsWithChildren<object>) => {
  const slots = { hijos: children };
  const { app } = useContext(FactoryCtx);
  // Punto de extensión Factory: vacío por defecto (cualquier app que no registre
  // Componentes.panel_asistente no ve nada aquí, cero impacto de layout). Solo
  // apps/olula lo registra hoy (ver apps/olula/src/factory.ts).
  // Sin permiso del asistente (regla comun.ia) tampoco se monta el panel.
  const PanelAsistente = puede(REGLA_ASISTENTE)
    ? (app.Componentes?.panel_asistente as (() => React.ReactNode) | undefined)
    : undefined;

  // Otro punto de extensión: banda de aviso a todo el ancho bajo la cabecera (la app
  // decide cuándo pintarla; ver apps/olula_saas). Debe ser un `div.banda-aviso-app`.
  const BandaAviso = app.Componentes?.banda_aviso as (() => React.ReactNode) | undefined;

  return (
    <>
      <MenuProvider>
        <SseSesionGlobal />
        <BusquedaRapidaGlobal />

        <Slot nombre="cabecera" {...slots}>
          <Cabecera />
        </Slot>

        {BandaAviso ? <BandaAviso /> : null}

        <section role="main">
          <MenuLateral />
          <ContenidoPantalla {...slots} />
          <MenuUsuario />
          {PanelAsistente ? <PanelAsistente /> : null}
        </section>
      </MenuProvider>

      <Slot nombre="pie" {...slots}>
        <Pie />
      </Slot>
    </>
  );
};
