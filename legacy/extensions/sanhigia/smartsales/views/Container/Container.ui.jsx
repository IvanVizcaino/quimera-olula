import { setNombrePagina } from "@olula/lib/nombrePagina.ts";
import { Box } from "@quimera/thirdparty";
import Quimera, { useAppValue, usePath, useRoutes, useStateValue, useWidth, util } from "quimera";
import { buildView, getMenus, getRoutes } from "quimera/hooks";
import { ACL } from "quimera/lib";
import { useEffect } from "react";

let routes = null;
let reglasPorRuta = null;

function normalizarRuta(ruta) {
  return ruta?.replace(/\/:[^/]+/g, "");
}

function construirReglasPorRuta() {
  const menuApp = getMenus()?.app;
  const mapa = {};

  Object.values(menuApp || {}).forEach(grupo => {
    Object.values(grupo?.items || {}).forEach(item => {
      if (item?.url && item?.rule) {
        mapa[item.url] = item.rule;
      }
    });
  });

  return mapa;
}

function obtenerReglaRuta(key, value) {
  if (value?.rule) return value.rule;

  const rutaNormalizada = normalizarRuta(key);
  return reglasPorRuta?.[key] ?? reglasPorRuta?.[rutaNormalizada];
}

function hookRoutes(loading) {
  if (loading) {
    return [];
  }
  if (!routes) {
    reglasPorRuta = construirReglasPorRuta();

    routes = Object.entries(getRoutes()).reduce((obj, [key, value]) => {
      const regla = obtenerReglaRuta(key, value);

      return {
        ...obj,
        ...{
          [key]: params =>
            (!regla || ACL.can(regla))
              ? buildView(value.view, { ...params })
              : buildView("Forbidden"),
        },
      };
    }, {});
  }

  return routes;
}


const loading = false;

function Container({ useStyles }) {
  const classes = useStyles();

  const [{ vistaMovil, modalVisible, tipoMensaje, nombrePaginaActual }, appDispatch] = useAppValue();
  const [{ authenticated }, dispatch] = useStateValue();
  const routeResult = useRoutes(hookRoutes(loading));
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const path = usePath();

  useEffect(() => {
    util.setSetting("appDispatch", appDispatch);
    appDispatch({ type: "updateMenus" });
  }, [appDispatch, vistaMovil, authenticated]);

  useEffect(() => {
    dispatch({ type: "onAuthenticatedChanged" });
  }, [authenticated]);

  useEffect(() => {
    setNombrePagina(nombrePaginaActual ?? "");
  }, [nombrePaginaActual]);

  const excepciones = ["/login", "/forgot-password", "/signup", "/welcome"];
  const isExcepcion = excepciones.find(excepcion => path && path.startsWith(excepcion));

  return (
    <Quimera.Template id="Container">
      {authenticated ? (
        <>
          <Box sx={{ padding: '1em', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* <Box id="HeaderContainer" height={`${headerHeight}px`}>
              <Quimera.View id="Header" />
              <Quimera.View id="Dialog" />
            </Box> */}
            <Quimera.SubView id="HeaderContainer" />
            <Box id="ViewContainer" sx={{ flexGrow: 1, overflowY: 'auto' }}>{routeResult || <Quimera.View id="PageNotFound" />}</Box>
            <Box height="0%">
              <Quimera.View id="Footer" />
            </Box>
          </Box>

          <Quimera.Block id="containerBlock" />
        </>
      ) : isExcepcion ? (
        routeResult || <Quimera.View id="PageNotFound" />
      ) : (
        // ? (<Quimera.View
        //   id="ForgotPassword"
        // />)
        <Quimera.View
          id="Login"
          onLogin={() =>
            dispatch({
              type: "setAuthenticated",
              payload: { authenticated: true },
            })
          }
        />
      )}

      <Quimera.View id="SnackBar" />
      {modalVisible && <Quimera.View id={modalVisible} />}
    </Quimera.Template>
  );
}

Container.displayName = "Container";
export default Container;
