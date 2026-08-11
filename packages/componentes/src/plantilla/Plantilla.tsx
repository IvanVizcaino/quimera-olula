import { PropsWithChildren, useContext } from "react";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { MenuLateral } from "../menu/menu-lateral.tsx";
import { MenuUsuario } from "../menu/menu-usuario.tsx";
import { Slot } from "../slot/Slot.tsx";
import { Cabecera } from "./Cabecera.tsx";
import { MenuProvider } from "./MenuContext.tsx";
import { Pie } from "./Pie.tsx";
import "./Plantilla.css";
import { SseSesionGlobal } from "./SseSesionGlobal.tsx";

export const Plantilla = ({ children }: PropsWithChildren<object>) => {
  const slots = { hijos: children };
  const { app } = useContext(FactoryCtx);
  // Punto de extensión Factory: vacío por defecto (cualquier app que no registre
  // Componentes.panel_asistente no ve nada aquí, cero impacto de layout). Solo
  // apps/olula lo registra hoy (ver apps/olula/src/factory.ts).
  const PanelAsistente = app.Componentes?.panel_asistente as (() => React.ReactNode) | undefined;

  return (
    <>
      <MenuProvider>
        <SseSesionGlobal />

        <Slot nombre="cabecera" {...slots}>
          <Cabecera />
        </Slot>

        <section role="main">
          <MenuLateral />
          <Slot {...slots} />
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
