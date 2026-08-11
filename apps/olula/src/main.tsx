import { authMiddleware } from "#/auth/middlewares.ts";
import { useTimerRefresco } from "#/auth/useTimerRefresco.ts";
import { InicioOlula, Vista } from "@olula/componentes/index.ts";
import "@olula/lib/comun.css";
import { FactoryObj, FactoryProvider } from "@olula/lib/factory_ctx.tsx";
import { crearMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { crearWidgets, WidgetContextFactory } from "@olula/lib/widgets.ts";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { FactoryOlula } from "./factory.ts";
import { router } from "./router_factory.ts";

const root = createRoot(document.getElementById("root")!);

const rutas = createBrowserRouter([
  {
    path: "/",
    middleware: [authMiddleware],
    Component: Vista,
    children: router as RouteObject[],
  },
]);

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
  useTimerRefresco();

  useEffect(() => {
    FactoryObj.setMenu(
      crearMenu(
        new FactoryOlula() as unknown as Record<string, MenuContextFactory>
      )
    );
    FactoryObj.setWidgets(
      crearWidgets(
        new FactoryOlula() as unknown as Record<string, WidgetContextFactory>
      )
    );
    FactoryObj.setApp(
      new FactoryOlula() as unknown as Record<string, Record<string, unknown>>
    );
  }, []);

  return (
    <>
      <RouterProvider router={rutas} />
      <InicioOlula />
    </>
  );
};

root.render(
  // <StrictMode>
  <FactoryProvider>
    <App />
  </FactoryProvider>
  // </StrictMode>
);
