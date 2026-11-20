import { AUTH_STORAGE_CHANGED_EVENT } from "@olula/lib/api/auth_storage_events.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { avisoSuscripcion, leerSuscripcionWhoami, REGLA_SUSCRIPCION, RUTA_SUSCRIPCION } from "../dominio.ts";
import "./BandaSuscripcion.css";

const leerAviso = () => avisoSuscripcion(leerSuscripcionWhoami(localStorage.getItem("whoami")));

/**
 * Banda discreta bajo la cabecera con el estado de la suscripción (whoami.saas.suscripcion).
 * Solo se ofrece el enlace si el usuario puede entrar en la página de suscripción.
 */
export const BandaSuscripcion = () => {
    const [aviso, setAviso] = useState(leerAviso);

    useEffect(() => {
        const actualizar = () => setAviso(leerAviso());
        window.addEventListener(AUTH_STORAGE_CHANGED_EVENT, actualizar);
        return () => window.removeEventListener(AUTH_STORAGE_CHANGED_EVENT, actualizar);
    }, []);

    if (!aviso) return null;
    const puedeVer = puede(REGLA_SUSCRIPCION);

    return (
        <div className={`banda-aviso-app banda-suscripcion ${aviso.variante}`} role="status">
            <span>{aviso.mensaje}</span>
            {puedeVer
                ? <Link to={RUTA_SUSCRIPCION}>{aviso.accion}</Link>
                : <span className="banda-suscripcion-admin">Pide a tu administrador que lo revise.</span>}
        </div>
    );
};
