import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { resetPasswordAPI } from "../infraestructura.ts";
import estilos from "./ResetPassword.module.css";

type Estado = "idle" | "cargando" | "completado" | "error_token" | "error";

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [estado, setEstado] = useState<Estado>("idle");
    const [token, setToken] = useState<string | null>(null);
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");

    useEffect(() => {
        const t = searchParams.get("token");
        if (!t) {
            setEstado("error_token");
        } else {
            setToken(t);
        }
    }, [searchParams]);

    const handleSubmit = async () => {
        if (!token) return;
        if (nuevaPassword !== confirmarPassword) {
            setEstado("error");
            return;
        }
        setEstado("cargando");
        return resetPasswordAPI(token, nuevaPassword)
            .then(() => setEstado("completado"))
            .catch(() => setEstado("error_token"));
    };

    if (estado === "error_token") {
        return (
            <section className={estilos.pagina}>
                <div className={estilos.cuerpo}>
                    <p className={estilos.error}>
                        El enlace no es válido o ha expirado.
                    </p>
                    <button className={estilos.botonVolver} onClick={() => navigate("/login")}>
                        Volver al inicio de sesión
                    </button>
                </div>
            </section>
        );
    }

    if (estado === "completado") {
        return (
            <section className={estilos.pagina}>
                <div className={estilos.cuerpo}>
                    <p className={estilos.exito}>
                        Contraseña restablecida correctamente.
                    </p>
                    <button className={estilos.botonVolver} onClick={() => navigate("/login")}>
                        Iniciar sesión
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className={estilos.pagina}>
            <h1>Nueva contraseña</h1>
            <div className={estilos.cuerpo}>
                <p>Introduce tu nueva contraseña.</p>
                <quimera-formulario>
                    <QInput
                        label="Nueva contraseña"
                        nombre="nueva_password"
                        tipo="contraseña"
                        valor={nuevaPassword}
                        onChange={(v) => setNuevaPassword(v)}
                    />
                    <QInput
                        label="Confirmar contraseña"
                        nombre="confirmar_password"
                        tipo="contraseña"
                        valor={confirmarPassword}
                        onChange={(v) => setConfirmarPassword(v)}
                    />
                    <div>
                        <QBoton
                            tamaño="mediano"
                            ancho
                            deshabilitado={estado === "cargando"}
                            onClick={handleSubmit}
                        >
                            {estado === "cargando" ? "Guardando..." : "Restablecer contraseña"}
                        </QBoton>
                    </div>
                </quimera-formulario>
                {estado === "error" && (
                    <p className={estilos.error}>Las contraseñas no coinciden.</p>
                )}
            </div>
        </section>
    );
};
