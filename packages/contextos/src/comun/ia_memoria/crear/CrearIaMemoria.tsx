import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postIaMemoria } from "../infraestructura.js";
import "./CrearIaMemoria.css";
import { metaNuevaIaMemoria, nuevaIaMemoriaVacia } from "./crear.js";

/**
 * Modal de alta de memoria del asistente de IA.
 *
 * Patrón:
 *   - El maestro lo renderiza condicionalmente cuando estado === "CREANDO".
 *   - Llama a postIaMemoria internamente y emite:
 *       "ia_memoria_creada" con el ID devuelto por la API (éxito)
 *       "alta_cancelada"    sin payload                     (cancelar)
 */
export const CrearIaMemoria = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo: iaMemoria, uiProps, valido } = useModelo(
        metaNuevaIaMemoria,
        nuevaIaMemoriaVacia
    );

    const crear_ = useCallback(
        async () => {
            const id = await postIaMemoria(iaMemoria);
            publicar("ia_memoria_creada", id);
        },
        [iaMemoria, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearIaMemoria"
            titulo="Nueva memoria del asistente"
            onCerrar={cancelar}
        >
            <div className="CrearIaMemoria">
                <quimera-formulario>
                    <QInput label="Título" {...uiProps("titulo")} ref={focus} />
                    <QTextArea label="Contenido" rows={8} {...uiProps("contenido")} />
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
