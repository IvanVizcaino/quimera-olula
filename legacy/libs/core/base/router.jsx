import { navigate as hookNavigate } from "hookrouter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export { usePath, useRoutes } from "hookrouter";

let _navigate = (to) => { window.location.href = to; }; // fallback

// Llama al navigate de react-router (para el middleware de auth).
// NO sincronizamos hookrouter aquí — lo hace RouterBridge vía useEffect([location.pathname]),
// lo que garantiza que history.back() también funciona (popstate → react-router actualiza
// location → RouterBridge sincroniza hookrouter).
export const navigate = (to, opts) => {
    _navigate(to, opts);
};

// Conecta el navigate de react-router y sincroniza hookrouter cada vez que
// react-router cambia la ubicación (p.ej. mediante <Link> en Cabecera, menu-lateral, etc.).
// Usa replace=true para que hookrouter no añada una entrada duplicada en el historial.
export function RouterBridge() {
    const nav = useNavigate();
    const location = useLocation();
    _navigate = nav;

    useEffect(() => {
        hookNavigate(location.pathname, true);
    }, [location.pathname]);

    return null;
}

export const A = ({ href, children, onClick, ...props }) => (
    <a
        href={href}
        onClick={(e) => {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
                e.preventDefault();
                navigate(href);
            }
            onClick?.(e);
        }}
        {...props}
    >
        {children}
    </a>
);


