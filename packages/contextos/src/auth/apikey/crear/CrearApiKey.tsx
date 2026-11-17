import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { OPCIONES_CADUCIDAD, metaNuevaApiKey, nuevaApiKeyVacia } from "../dominio.ts";
import { postApiKey } from "../infraestructura.ts";
import "./CrearApiKey.css";

/**
 * Modal de alta de una clave de API propia. Emite:
 *   "clave_creada"   con el valor de la clave (solo se ve esta vez)
 *   "alta_cancelada" sin payload
 */
export const CrearApiKey = ({ publicar }: { publicar: EmitirEvento }) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevaApiKey, nuevaApiKeyVacia);

    const crear_ = useCallback(async () => {
        const clave = await postApiKey(modelo);
        publicar("clave_creada", clave);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearApiKey" titulo="Nueva clave de API" onCerrar={cancelar}>
            <div className="CrearApiKey">
                <p>
                    La clave da acceso a Olula con tus permisos. Ponle un nombre que te diga
                    dónde la vas a usar, por ejemplo «Claude Code del portátil».
                </p>
                <quimera-formulario>
                    <QInput label="Nombre" {...uiProps("nombre")} ref={focus} />
                    <QSelect label="Caduca en" {...uiProps("expiracion")} opciones={OPCIONES_CADUCIDAD} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
