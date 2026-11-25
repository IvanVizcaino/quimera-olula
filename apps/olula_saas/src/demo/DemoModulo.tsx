import { DemoModulo, MENSAJE_DEMO_LISTA } from "#/saas_suscripcion/demo/registro.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError, Intentar, QError } from "@olula/lib/contexto.ts";
import { FactoryObj, FactoryProvider } from "@olula/lib/factory_ctx.tsx";
import { crearWidgets, WidgetContextFactory } from "@olula/lib/widgets.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, NavLink, Outlet, RouteObject, RouterProvider } from "react-router";
import { router } from "../../../olula/src/router_factory.ts";
import { FactoryOlulaSaas } from "../factory.ts";

/**
 * Las pantallas guardan el registro abierto en la URL de la ventana (?id=…). Al cambiar de
 * pantalla en la demo se deja solo el módulo, para que la siguiente no intente abrir un id
 * que no es suyo.
 */
const limpiarUrl = () => {
    const modulo = new URLSearchParams(location.search).get("modulo") ?? "";
    history.replaceState(history.state, "", `${location.pathname}?modulo=${encodeURIComponent(modulo)}`);
};

/** Marco de la demo: sin menú ni cabecera de la app, con su propio aviso de errores. */
// eslint-disable-next-line react-refresh/only-export-components
const MarcoDemo = ({ demo }: { demo: DemoModulo }) => {
    const [error, setError] = useState<QError | null>(null);

    // Avisa a la ficha del módulo (ventana padre) de que la pantalla ya está pintada, para
    // que quite el esqueleto. Dos fotogramas: el primero monta, el segundo ya está en pantalla.
    useEffect(() => {
        const id = requestAnimationFrame(() => requestAnimationFrame(() => {
            if (window.parent !== window) window.parent.postMessage({ tipo: MENSAJE_DEMO_LISTA }, location.origin);
        }));
        return () => cancelAnimationFrame(id);
    }, []);
    const intentar: Intentar = useCallback(async (f, onError) => {
        try {
            return await f();
        } catch (e) {
            const err = e as QError & Error;
            setError({ nombre: err.nombre ?? "Error", descripcion: err.descripcion ?? err.message });
            onError?.(e);
            throw e;
        }
    }, []);

    return (
        <ContextoError.Provider value={{ error, setError, intentar }}>
            <div className="DemoModulo">
                <p className="demo-aviso" role="note">
                    <strong>Modo demo</strong> · Datos de ejemplo. {demo.guia} Los cambios no se guardan.
                </p>
                {demo.pantallas.length > 1 && (
                    <nav className="demo-pantallas" aria-label="Pantallas de la demo">
                        {demo.pantallas.map((p) => <NavLink key={p.ruta} to={p.ruta} onClick={limpiarUrl}>{p.nombre}</NavLink>)}
                    </nav>
                )}
                <main className="demo-contenido"><Outlet /></main>
            </div>
            <QModal nombre="error_demo" abierto={error !== null} onCerrar={() => setError(null)} titulo={error?.nombre}>
                <p>{error?.descripcion}</p>
                <div className="botones maestro-botones">
                    <QBoton onClick={() => setError(null)}>Cerrar</QBoton>
                </div>
            </QModal>
        </ContextoError.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
const App = ({ demo }: { demo: DemoModulo }) => {
    const [listo, setListo] = useState(false);
    useEffect(() => {
        const factory = new FactoryOlulaSaas();
        FactoryObj.setWidgets(crearWidgets(factory as unknown as Record<string, WidgetContextFactory>));
        FactoryObj.setApp(factory as unknown as Record<string, Record<string, unknown>>);
        setListo(true);
    }, []);
    const rutas = useMemo(() => createMemoryRouter(
        [{ path: "/", element: <MarcoDemo demo={demo} />, children: router as RouteObject[] }],
        { initialEntries: [demo.pantallas[0].ruta] },
    ), [demo]);
    return listo ? <RouterProvider router={rutas} /> : null;
};

export const montarDemo = (raiz: HTMLElement, demo: DemoModulo) =>
    createRoot(raiz).render(
        <FactoryProvider>
            <App demo={demo} />
        </FactoryProvider>,
    );
