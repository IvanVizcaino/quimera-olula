import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { ErrorRegistro, postRegistro } from "../infraestructura.ts";
import { Captcha } from "./Captcha.tsx";
import { captchaActivo } from "./captcha.ts";
import { metaNuevoRegistro, nuevoRegistroInicial } from "./registro.ts";
import estilos from "./Registro.module.css";
import { SelectorPlan } from "./SelectorPlan.tsx";
import { PlanRegistro } from "./usePlanRegistro.ts";

/**
 * Formulario de registro de una empresa, reutilizado en /registro y en la landing. El plan y la
 * periodicidad los controla quien lo monta (usePlanRegistro). Al enviarlo muestra el aviso de
 * «Revisa tu correo» y avisa con `onEnviado`.
 */
export const FormularioRegistro = ({ plan, onEnviado, tituloAviso = true }: {
    plan: PlanRegistro;
    /** false si quien lo monta ya pinta su propio título para el estado «Revisa tu correo». */
    tituloAviso?: boolean;
    onEnviado?: (email: string) => void;
}) => {
    const inicial = useMemo(nuevoRegistroInicial, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevoRegistro, inicial);
    const [captcha, setCaptcha] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [enviadoA, setEnviadoA] = useState<string | null>(null);
    const { seleccion } = plan;

    const enviar = useCallback(async () => {
        setError(null);
        setEnviando(true);
        try {
            const resultado = await postRegistro(modelo, captcha, seleccion);
            setEnviadoA(resultado.email);
            onEnviado?.(resultado.email);
        } catch (e) {
            setError(e instanceof ErrorRegistro ? e.message : "No se ha podido completar el registro");
        } finally {
            setEnviando(false);
        }
    }, [modelo, captcha, seleccion, onEnviado]);

    if (enviadoA) {
        return (
            <div className={estilos.formulario} role="status">
                {tituloAviso && <h2 className={estilos.avisoTitulo}>Revisa tu correo</h2>}
                <p>
                    Te hemos enviado un enlace a <strong>{enviadoA}</strong> para confirmar tu email.
                    Al confirmarlo crearemos tu empresa. El enlace caduca en 24 horas.
                </p>
            </div>
        );
    }

    return (
        <div className={estilos.formulario}>
            <quimera-formulario>
                <QInput label="Nombre de la empresa" {...uiProps("nombreEmpresa")} />
                <QInput label="NIF" {...uiProps("nif")} />
                <QInput label="Tu nombre" {...uiProps("nombre")} />
                <QInput label="Email" {...uiProps("email")} tipo="email" />
                <QInput label="Contraseña" {...uiProps("contraseña")} tipo="contraseña" />
                <QInput label="Repite la contraseña" {...uiProps("repetirContraseña")} tipo="contraseña" />
                <SelectorPlan plan={plan} />
                <Captcha onToken={setCaptcha} />
                {error && <div role="alert" className={estilos.error}>{error}</div>}
                <div>
                    <QBoton tamaño="mediano" ancho onClick={enviar}
                        deshabilitado={!valido || enviando || (captchaActivo && !captcha)}>
                        {enviando ? "Enviando…" : "Crear cuenta"}
                    </QBoton>
                </div>
            </quimera-formulario>
        </div>
    );
};
