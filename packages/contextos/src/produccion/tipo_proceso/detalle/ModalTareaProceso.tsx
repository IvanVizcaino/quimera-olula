import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { SelectorTipoTarea } from "../../tipo_tarea/SelectorTipoTarea.tsx";
import { FormTareaProceso } from "../diseño.ts";
import { LONGITUD_DESCRIPCION_TIPO_PROCESO, metaFormTareaProceso } from "../dominio.ts";

/**
 * Alta o cambio de una tarea del tipo de proceso. En un tipo secuencial las marcas de inicial y
 * final las pone el servidor según el orden.
 */
export const ModalTareaProceso = ({
    titulo,
    inicial,
    secuencial,
    guardar,
    cerrar,
}: {
    titulo: string;
    /** Constante mientras el modal está abierto. */
    inicial: FormTareaProceso;
    secuencial: boolean;
    guardar: (tarea: FormTareaProceso) => Promise<void>;
    cerrar: () => void;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaFormTareaProceso, inicial);

    const guardar_ = useCallback(() => guardar(modelo), [guardar, modelo]);
    const [aceptar, cancelar] = useForm(guardar_, cerrar);

    return (
        <QModal abierto={true} nombre="tareaProceso" titulo={titulo} onCerrar={cancelar}>
            <div className="ModalTareaProceso">
                <quimera-formulario>
                    <SelectorTipoTarea {...uiProps("tipoTareaId")} />
                    <QInput label="Descripción (vacía: la del tipo de tarea)" {...uiProps("descripcion")}
                        maxLength={LONGITUD_DESCRIPCION_TIPO_PROCESO} />
                    <QInput label="Orden (vacío: la última)" {...uiProps("orden")} />
                    <QCheckbox label="Inicial" {...uiProps("inicial")} deshabilitado={secuencial} />
                    <QCheckbox label="Final" {...uiProps("final")} deshabilitado={secuencial} />
                    <QCheckbox label="Termina en un paso" {...uiProps("terminaEnUnPaso")} />
                    <QCheckbox label="Verificar consumos" {...uiProps("verificarConsumos")} />
                    <QCheckbox label="Opcional" {...uiProps("opcional")} />
                </quimera-formulario>
                {secuencial && (
                    <p className="nota-secuencial">
                        Tipo secuencial: la primera tarea por orden es la inicial y la última la final.
                    </p>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={aceptar} deshabilitado={!valido}>Guardar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
