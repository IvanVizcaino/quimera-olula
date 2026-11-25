import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { TipoProceso } from "../diseño.ts";
import {
    copiaTipoProcesoVacia,
    LONGITUD_CODIGO_TIPO_PROCESO,
    LONGITUD_DESCRIPCION_TIPO_PROCESO,
    metaCopiaTipoProceso,
} from "../dominio.ts";
import { copiarTipoProceso } from "../infraestructura.ts";

/**
 * Copia el tipo de proceso con sus tareas (con códigos nuevos) y sus secuencias; los tiempos de
 * tareas no se copian. Llama a `copiado` con el id del tipo nuevo.
 */
export const CopiarTipoProceso = ({
    tipo,
    copiado,
    cerrar,
}: {
    tipo: TipoProceso;
    copiado: (id: string) => Promise<void>;
    cerrar: () => void;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaCopiaTipoProceso, copiaTipoProcesoVacia);

    const copiar = useCallback(async () => {
        const id = await copiarTipoProceso(tipo.id, modelo);
        await copiado(id);
    }, [tipo.id, modelo, copiado]);

    const [aceptar, cancelar] = useForm(copiar, cerrar);
    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="copiarTipoProceso" titulo={`Copiar tipo de proceso ${tipo.id}`} onCerrar={cancelar}>
            <div className="CopiarTipoProceso">
                <quimera-formulario>
                    <QInput label="Código nuevo" {...uiProps("nuevoId")} maxLength={LONGITUD_CODIGO_TIPO_PROCESO} ref={focus} />
                    <QInput label="Descripción (vacía: la del original)" {...uiProps("descripcion")}
                        maxLength={LONGITUD_DESCRIPCION_TIPO_PROCESO} />
                </quimera-formulario>
                <p>Se copian las tareas y las secuencias; los tiempos de las tareas no.</p>
                <div className="botones maestro-botones">
                    <QBoton onClick={aceptar} deshabilitado={!valido}>Copiar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
