import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { LineaModulo, ModLin } from "../diseño.js";
import { metaLineaModulo } from "../dominio.js";
import { patchLineaModulo } from "../infraestructura.js";

export const CambiarLineaModulo = ({
    modLin,
    linea,
    publicar,
}: {
    modLin: ModLin;
    linea: LineaModulo;
    publicar: EmitirEvento;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaLineaModulo, linea);

    const cambiar_ = useCallback(
        async () => {
            await patchLineaModulo(modLin.id, linea.id, modelo);
            publicar("linea_cambiada", linea);
        },
        [modelo, publicar, modLin.id, linea]
    );

    const cancelar_ = useCallback(
        () => publicar("cambio_de_linea_cancelado"),
        [publicar]
    );

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="mostrar"
            titulo="Cambiar línea"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Campo String" {...uiProps("campoString")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido}>
                    Cambiar
                </QBoton>
            </div>
        </QModal>
    );
};
