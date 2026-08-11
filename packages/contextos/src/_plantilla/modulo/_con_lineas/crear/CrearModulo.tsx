import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postModLin } from "../infraestructura.js";
import { metaNuevoModulo, nuevoModLinVacio } from "./crear.js";

/**
 * Modal de alta de módulo (con líneas).
 *
 * Patrón:
 *   - El maestro lo renderiza condicionalmente cuando estado === "CREANDO".
 *   - Llama a postModLin internamente y emite:
 *       "modulo_creado"            con el ID devuelto por la API  (éxito)
 *       "alta_de_modulo_cancelada" sin payload                    (cancelar)
 *   - No recibe prop `activo`; la visibilidad la controla el padre.
 */
export const CrearModulo = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo: modLin, uiProps, valido } = useModelo(
        metaNuevoModulo,
        nuevoModLinVacio()
    );

    const crear_ = useCallback(
        async () => {
            const id = await postModLin(modLin);
            publicar("modulo_creado", id);
        },
        [modLin, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_modulo_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="mostrar"
            titulo="Crear módulo"
            onCerrar={cancelar}
        >
            <div className="CrearModulo">
                <quimera-formulario>
                    <QInput label="Campo string" {...uiProps("campoString")} ref={focus} />
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
