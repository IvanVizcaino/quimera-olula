import { useTimerRefresco } from "#/auth/useTimerRefresco.ts";
import { RUTAS_PUBLICAS_REGISTRO, rutasRegistroSaas } from "#/saas_registro/router_factory.ts";
import { registrarAccionesErrorSuscripcion } from "#/saas_suscripcion/acciones_error.ts";
import { RouterFactorySaasSuscripcion } from "#/saas_suscripcion/router_factory.ts";
import { InicioOlula, Vista } from "@olula/componentes/index.ts";
import { FactoryObj, FactoryProvider } from "@olula/lib/factory_ctx.tsx";
import { crearMenu, MenuContextFactory } from "@olula/lib/menu.ts";
import { crearRouter } from "@olula/lib/router.ts";
import { crearWidgets, WidgetContextFactory } from "@olula/lib/widgets.ts";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { router } from "../../olula/src/router_factory.ts";
import { FactoryOlulaSaas } from "./factory.ts";
import { authMiddlewareSaas } from "./middlewares.ts";
import { usePersonalizacionTenant } from "./personalizacion.ts";

// Errores de límites del plan (409/402/403): enlace a la suscripción junto al mensaje.
registrarAccionesErrorSuscripcion();

const rutasSaas = crearRouter({
    SaasSuscripcion: RouterFactorySaasSuscripcion,
} as unknown as Record<string, { router: RouteObject }>);

/**
 * Olula SaaS: el mismo ERP que apps/olula contra la API multi-empresa
 * (olula_servidor apps/olula_saas), más el registro público. Los módulos no
 * contratados se ocultan solos: whoami trae `saas.modulos_bloqueados` y `puede()`
 * los deniega (menú, pantallas y botones).
 */
const root = createRoot(document.getElementById("root")!);

const rutas = createBrowserRouter([
    ...rutasRegistroSaas,
    {
        path: "/",
        middleware: [authMiddlewareSaas],
        Component: Vista,
        children: [...(router as RouteObject[]), ...rutasSaas],
    },
]);

// eslint-disable-next-line react-refresh/only-export-components
const App = () => {
    useTimerRefresco({ rutasPublicas: RUTAS_PUBLICAS_REGISTRO });
    usePersonalizacionTenant();

    useEffect(() => {
        const factory = new FactoryOlulaSaas();
        FactoryObj.setMenu(crearMenu(factory as unknown as Record<string, MenuContextFactory>));
        FactoryObj.setWidgets(crearWidgets(factory as unknown as Record<string, WidgetContextFactory>));
        FactoryObj.setApp(factory as unknown as Record<string, Record<string, unknown>>);
    }, []);

    return (
        <>
            <RouterProvider router={rutas} />
            <InicioOlula />
        </>
    );
};

root.render(
    <FactoryProvider>
        <App />
    </FactoryProvider>
);
