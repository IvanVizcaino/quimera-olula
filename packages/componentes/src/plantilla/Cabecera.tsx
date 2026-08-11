import { OlulaWordmark } from "@olula/componentes/tema/Olula.jsx";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import {
  PANEL_LATERAL_ABIERTO_EVENT,
  notificarPanelLateralAbierto,
  solicitarTogglePanelLateral,
} from "@olula/lib/panel_lateral_events.ts";
import { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { QIcono } from "../atomos/qicono.tsx";
import "./Cabecera.css";
import { NotificacionesCabecera } from "./NotificacionesCabecera.tsx";
import { estaAutentificado } from "./autenticacion";
import { useMenuControl } from "./useMenuControl";

export type CabeceraProps = {
  logoSrc?: string;
  logoAlt?: string;
  logoClassName?: string;
  Logo?: (() => React.ReactNode) | null;
  Titulo?: () => React.ReactNode;
  NotificacionesCabecera?: () => React.ReactNode;
  AccionesCabecera?: () => React.ReactNode;
  MenuUsuario?: () => React.ReactNode;
  ExtraLogo?: () => React.ReactNode;
  /** Si la app registra Componentes.panel_asistente (ver Plantilla.tsx) — controla si
   * se muestra el icono que lo abre. En apps que no lo registran, no hay nada que
   * abrir, así que el icono no debe aparecer. */
  mostrarAsistente?: boolean;
};

export const CabeceraBase = ({
  logoSrc = "/olula-wordmark.svg",
  logoAlt = "Olula | Inicio",
  Logo = () =>
    OlulaWordmark({
      color: "#ffffff",
      bowlColor: "#ffffff",
      className: "logo-app",
      style: {},
    }),
  Titulo,
  NotificacionesCabecera: Notificaciones,
  AccionesCabecera,
  MenuUsuario,
  ExtraLogo,
  mostrarAsistente = false,
}: CabeceraProps) => {
  const { menuAbierto, toggleMenu, cerrarMenu } = useMenuControl();
  const autenticado = estaAutentificado();

  useEffect(() => {
    // El panel lateral del asistente (packages/contextos, fuera de este árbol de
    // MenuProvider) avisa por evento cuando se abre, para que el menú de usuario se
    // cierre — misma zona de pantalla, no deben convivir abiertos a la vez.
    const alAbrirPanelLateral = (e: Event) => {
      if ((e as CustomEvent<string>).detail === "asistente") cerrarMenu("usuario");
    };
    window.addEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirPanelLateral);
    return () => window.removeEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirPanelLateral);
  }, [cerrarMenu]);

  console.log("Logo", Logo);
  return (
    <>
      <header className="cabecera-principal">
        <button
          id="boton-menu-lateral"
          aria-label="Abrir menú lateral"
          onClick={() => toggleMenu("lateral")}
        ></button>

        <label htmlFor="boton-menu-lateral" id="etiqueta-menu-abierto" />
        <Link to="/">
          {Logo ? (
            <Logo />
          ) : (
            <img src={logoSrc} alt={logoAlt} className="logo-app" />
          )}
        </Link>
        {ExtraLogo ? <ExtraLogo /> : null}
        <div id="cabecera-titulo">{Titulo ? <Titulo /> : null}</div>
        <div id="cabecera-acciones">
          <div id="cabecera-acciones-globales">
            {Notificaciones ? <Notificaciones /> : null}
          </div>
          <div id="cabecera-acciones-extra">
            {AccionesCabecera ? <AccionesCabecera /> : null}
          </div>
        </div>
        {autenticado && mostrarAsistente && (
          <>
            <button
              id="boton-asistente"
              aria-label="Abrir asistente"
              onClick={() => solicitarTogglePanelLateral("asistente")}
            ></button>
            <label htmlFor="boton-asistente" id="etiqueta-asistente-abierto">
              <QIcono nombre="asistente" tamaño="sm" />
            </label>
          </>
        )}
        {autenticado && (
          <>
            <button
              id="boton-menu-usuario"
              aria-label="Abrir menú usuario"
              onClick={() => {
                const yaAbierto = menuAbierto.usuario;
                toggleMenu("usuario");
                if (!yaAbierto) notificarPanelLateralAbierto("usuario");
              }}
            ></button>
            <label
              htmlFor="boton-menu-usuario"
              id="etiqueta-menu-usuario-abierto"
            >
              {MenuUsuario ? (
                <MenuUsuario />
              ) : (
                <QIcono nombre="perfil" tamaño="sm" />
              )}
            </label>
          </>
        )}
      </header>
    </>
  );
};

export const Cabecera = (props: CabeceraProps) => {
  const { app } = useContext(FactoryCtx);
  const CabeceraCustom = app.Componentes?.cabecera as typeof CabeceraBase;
  const NotificacionesCabeceraCustom = app.Componentes
    ?.cabecera_notificaciones as () => React.ReactNode;
  const AccionesCabecera = app.Componentes
    ?.cabecera_acciones as () => React.ReactNode;
  const MenuUsuario = app.Componentes
    ?.cabecera_menu_usuario as () => React.ReactNode;
  const ExtraLogo = app.Componentes
    ?.cabecera_extra_logo as () => React.ReactNode;
  const mostrarAsistente = Boolean(app.Componentes?.panel_asistente);
  const cProps: CabeceraProps = {
    ...props,
    NotificacionesCabecera:
      NotificacionesCabeceraCustom ||
      props.NotificacionesCabecera ||
      NotificacionesCabecera,
    // Logo: Logo || props.Logo,
    AccionesCabecera: AccionesCabecera || props.AccionesCabecera,
    MenuUsuario: MenuUsuario || props.MenuUsuario,
    ExtraLogo: ExtraLogo || props.ExtraLogo,
    Titulo: props.Titulo,
    mostrarAsistente,
  };

  const { pathname } = useLocation();

  const rutasExcluidas = [
    "/login",
    "/forgot-password",
    "/signup",
    "/welcome",
    "/auth/passkey/enlace-magico",
    "/auth/reset-password",
  ];
  const esRutaExcluida = rutasExcluidas.some((ruta) =>
    pathname.startsWith(ruta)
  );

  if (esRutaExcluida) {
    return null;
  }

  return CabeceraCustom ? (
    <CabeceraCustom {...cProps} />
  ) : (
    <CabeceraBase {...cProps} />
  );
};
