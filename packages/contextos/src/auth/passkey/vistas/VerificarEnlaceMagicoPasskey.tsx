import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { verificarEnlaceMagico } from "../dominio.ts";
import { BotonRegistrarPasskey } from "./BotonRegistrarPasskey.tsx";
import estilos from "./VerificarEnlaceMagicoPasskey.module.css";

type Estado = "cargando" | "verificado" | "error";

export const VerificarEnlaceMagicoPasskey = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [estado, setEstado] = useState<Estado>("cargando");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            setEstado("error");
            return;
        }
        verificarEnlaceMagico(token)
            .then(() => setEstado("verificado"))
            .catch(() => setEstado("error"));
    }, [searchParams]);

    if (estado === "cargando") {
        return (
            <section className={estilos.pagina}>
                <div className={estilos.cuerpo}>
                    <p className={estilos.cargando}>Verificando enlace...</p>
                </div>
            </section>
        );
    }

    if (estado === "error") {
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

    return (
        <section className={estilos.pagina}>
            <h1>Crear passkey</h1>
            <div className={estilos.cuerpo}>
                <p>
                    Enlace verificado correctamente. Ahora puedes registrar tu passkey
                    para acceder sin contraseña.
                </p>
                <BotonRegistrarPasskey onExito={() => navigate("/")} />
            </div>
        </section>
    );
};
