import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useState } from "react";
import { whoAmIStorage } from "../../login/infraestructura.ts";
import { registrarPasskey } from "../dominio.ts";

type Estado = "idle" | "cargando" | "exito" | "error";

export const BotonRegistrarPasskey = ({ onExito }: { onExito?: () => void } = {}) => {
    const [estado, setEstado] = useState<Estado>("idle");

    const handleClick = async () => {
        const whoAmI = whoAmIStorage.obtener();
        const email = whoAmI ? (JSON.parse(whoAmI) as { usuario_id: string }).usuario_id : "";

        if (!email) {
            setEstado("error");
            return;
        }

        setEstado("cargando");
        registrarPasskey(email)
            .then(() => { setEstado("exito"); onExito?.(); })
            .catch(() => setEstado("error"));
    };

    return (
        <div>
            <QBoton
                variante="borde"
                tamaño="mediano"
                onClick={handleClick}
                deshabilitado={estado === "cargando"}
            >
                {estado === "cargando" ? "Registrando..." : "Añadir passkey"}
            </QBoton>
            {estado === "exito" && (
                <p style={{ color: "var(--color-exito, green)", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                    Passkey registrada correctamente.
                </p>
            )}
            {estado === "error" && (
                <p style={{ color: "var(--color-error, red)", marginTop: "0.5rem", fontSize: "0.875rem" }}>
                    No se pudo registrar la passkey. Inténtalo de nuevo.
                </p>
            )}
        </div>
    );
};
