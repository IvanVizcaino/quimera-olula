import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposDivisa } from "../detalle/CamposDivisa.tsx";
import { metaNuevoDivisa, nuevoDivisaVacio } from "../dominio.ts";
import { postDivisa } from "../infraestructura.ts";

export const CrearDivisa = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoDivisaVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoDivisa, inicial);

    const crear_ = useCallback(async () => {
        const id = await postDivisa(modelo);
        publicar("divisa_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_divisa_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearDivisa" titulo="Nueva divisa" onCerrar={cancelar}>
            <div className="CrearDivisa">
                <quimera-formulario>
                    <QInput label="Código" {...uiProps("id")} ref={focus} />
                    <CamposDivisa uiProps={uiProps} />
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
