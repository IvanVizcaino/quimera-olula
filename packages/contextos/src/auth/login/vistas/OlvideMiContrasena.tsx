import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useState } from "react";
import { solicitarResetPasswordAPI } from "../infraestructura.ts";
import estilos from "./OlvideMiContrasena.module.css";

type Estado = "idle" | "cargando" | "enviado" | "error";

export const OlvideMiContrasena = () => {
    const [estado, setEstado] = useState<Estado>("idle");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [email, setEmail] = useState("");

    const handleEnviar = async () => {
        setEstado("cargando");
        return solicitarResetPasswordAPI(email)
            .then(() => setEstado("enviado"))
            .catch(() => setEstado("error"));
    };

    if (estado === "enviado") {
        return (
            <p className={estilos.exito}>
                Revisa tu email. Te hemos enviado un enlace para restablecer tu contraseña.
            </p>
        );
    }

    if (!mostrarFormulario) {
        return (
            <div className={estilos.olvideMiContrasena}>
                <button className={estilos.link} onClick={() => setMostrarFormulario(true)}>
                    ¿Olvidaste tu contraseña?
                </button>
            </div>
        );
    }

    return (
        <div>
            <p className={estilos.descripcion}>
                Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <quimera-formulario>
                <QInput
                    label="Email"
                    nombre="email"
                    tipo="email"
                    valor={email}
                    onChange={(v) => setEmail(v)}
                />
                <div>
                    <QBoton tamaño="mediano" ancho deshabilitado={estado === "cargando"} onClick={handleEnviar}>
                        {estado === "cargando" ? "Enviando..." : "Enviar enlace"}
                    </QBoton>
                </div>
            </quimera-formulario>
            {estado === "error" && (
                <p className={estilos.error}>
                    No se pudo enviar el enlace. Inténtalo de nuevo.
                </p>
            )}
        </div>
    );
};
