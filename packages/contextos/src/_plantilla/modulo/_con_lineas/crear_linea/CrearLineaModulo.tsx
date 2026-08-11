import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { ModLin } from "../diseño.js";
import { metaNuevaLineaModulo, nuevaLineaModuloVacia } from "../dominio.js";
import { postLineaModulo } from "../infraestructura.js";

export const CrearLineaModulo = ({
    modLin,
    publicar,
}: {
    modLin: ModLin;
    publicar: EmitirEvento;
}) => {
    const { modelo, uiProps, valido } = useModelo(
        metaNuevaLineaModulo,
        nuevaLineaModuloVacia()
    );

    const crear_ = useCallback(
        async () => {
            const idLinea = await postLineaModulo(modLin.id, modelo);
            publicar("linea_creada", idLinea);
        },
        [modelo, publicar, modLin.id]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_linea_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="mostrar"
            titulo="Crear línea"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Campo String" {...uiProps("campoString")} ref={focus} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Crear
                </QBoton>
            </div>
        </QModal>
    );
};
