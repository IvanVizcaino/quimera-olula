import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useState } from "react";
import { useNavigate } from "react-router";
import { permisosGrupo, whoAmI, whoAmIStorage } from "../../login/infraestructura.ts";
import { autenticarConPasskey } from "../dominio.ts";

type Estado = "idle" | "cargando" | "error";

export const BotonLoginPasskey = () => {
    const navigate = useNavigate();
    const [estado, setEstado] = useState<Estado>("idle");
    const [mostrarInfo, setMostrarInfo] = useState(false);

    const handleClick = async () => {
        setEstado("cargando");
        autenticarConPasskey()
            .then(() => whoAmI())
            .then((datosWhoAmI) => {
                whoAmIStorage.actualizar(datosWhoAmI);
                permisosGrupo.actualizar(datosWhoAmI.permisos);
            })
            .then(() => navigate("/"))
            .catch(() => setEstado("error"));
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <QBoton
                    variante="borde"
                    tamaño="mediano"
                    onClick={handleClick}
                    deshabilitado={estado === "cargando"}
                >
                    {estado === "cargando" ? "Verificando..." : "Iniciar sesión con passkey"}
                </QBoton>
                <button
                    type="button"
                    onClick={() => setMostrarInfo((v) => !v)}
                    style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "50%",
                        border: "1px solid var(--color-texto-secundario, #888)",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        color: "var(--color-texto-secundario, #888)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        lineHeight: 1,
                    }}
                    aria-label="Más información sobre passkeys"
                    aria-expanded={mostrarInfo}
                >
                    ?
                </button>
            </div>
            {mostrarInfo && (
                <div
                    role="region"
                    aria-label="Ventajas de las passkeys"
                    style={{
                        marginTop: "0.75rem",
                        padding: "0.75rem",
                        background: "var(--color-fondo-sutil, #f5f7ff)",
                        border: "1px solid var(--color-borde, #d0d5e8)",
                        borderRadius: "0.375rem",
                        fontSize: "0.8125rem",
                        color: "var(--color-texto-primario)",
                        lineHeight: "1.5",
                    }}
                >
                    <strong style={{ display: "block", marginBottom: "0.375rem" }}>¿Por qué usar una passkey?</strong>
                    <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                        <li>Sin contraseña que recordar ni que robar</li>
                        <li>Protegida por tu dispositivo (huella, cara o PIN)</li>
                        <li>Resistente al phishing</li>
                        <li>Inicio de sesión más rápido</li>
                    </ul>
                </div>
            )}
            {estado === "error" && (
                <p style={{ color: "var(--color-error, red)", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                    No se pudo autenticar con passkey. Inténtalo de nuevo.
                </p>
            )}
        </div>
    );
};
