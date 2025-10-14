import { Vista } from "@olula/componentes/index.ts";
import "@olula/lib/comun.css";
import { FactoryObj, FactoryProvider } from "@olula/lib/factory_ctx.tsx";
import { crearMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { FactoryGUA } from "./factory.ts";
import { router } from "./router_factory.ts";

const root = createRoot(document.getElementById("root")!);

const rutas = createBrowserRouter([
  {
    path: "/",
    Component: Vista,
    children: router as RouteObject[],
  },
]);

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
  FactoryObj.setMenu(
    crearMenu(new FactoryGUA() as unknown as Record<string, MenuContextFactory>)
  );
  FactoryObj.setApp(
    new FactoryGUA() as unknown as Record<string, Record<string, unknown>>
  );

  return <RouterProvider router={rutas} />;
};

root.render(
  <StrictMode>
    <FactoryProvider>
      <App />
    </FactoryProvider>
  </StrictMode>
);
