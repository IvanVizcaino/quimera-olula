import { useState } from "react";
import { Link } from "react-router";
import { FormularioRegistro } from "./FormularioRegistro.tsx";
import estilos from "./Registro.module.css";
import { usePlanRegistro } from "./usePlanRegistro.ts";

/**
 * Registro público de una empresa en Olula. Tras enviar el formulario la empresa
 * queda pendiente de verificar el email; el enlace del correo lleva a
 * /registro/verificar, que crea la empresa.
 */
export const Registro = () => {
    const plan = usePlanRegistro();
    const [enviado, setEnviado] = useState(false);

    return (
        <section className={estilos.login}>
            <div className="title"><h1>{enviado ? "Revisa tu correo" : "Empieza con Olula"}</h1></div>
            <div className={estilos.loginForm}>
                <FormularioRegistro plan={plan} tituloAviso={false} onEnviado={() => setEnviado(true)} />
                {!enviado && (
                    <p style={{ textAlign: "center", marginTop: "1rem" }}>
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                    </p>
                )}
            </div>
        </section>
    );
};
