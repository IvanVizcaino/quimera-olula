import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useState } from "react";
import { solicitarEnlaceMagico } from "../dominio.ts";
import estilos from "./EnlaceMagicoPasskey.module.css";

type Estado = "idle" | "cargando" | "enviado" | "error";

export const EnlaceMagicoPasskey = () => {
    const [estado, setEstado] = useState<Estado>("idle");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [email, setEmail] = useState("");

    const handleEnviar = async () => {
        setEstado("cargando");
        return solicitarEnlaceMagico(email)
            .then(() => setEstado("enviado"))
            .catch(() => setEstado("error"));
    };

    if (estado === "enviado") {
        return (
            <p className={estilos.exito}>
                Revisa tu email. Te hemos enviado un enlace para crear tu passkey.
            </p>
        );
    }

    if (!mostrarFormulario) {
        return (
            <div className={estilos.enlaceMagico}>
                <button className={estilos.link} onClick={() => setMostrarFormulario(true)}>
                    ¿Sin passkey? Solicita un enlace mágico
                </button>
            </div>
        );
    }

    return (
        <div>
            <p className={estilos.descripcion}>
                Introduce tu email y te enviaremos un enlace para crear tu passkey.
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
