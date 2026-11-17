import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposBanco } from "../detalle/CamposBanco.tsx";
import { metaNuevoBanco, nuevoBancoVacio } from "../dominio.ts";
import { postBanco } from "../infraestructura.ts";

export const CrearBanco = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoBancoVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoBanco, inicial);

    const crear_ = useCallback(async () => {
        const id = await postBanco(modelo);
        publicar("banco_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_banco_cancelado"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearBanco" titulo="Nuevo banco" onCerrar={cancelar}>
            <div className="CrearBanco">
                <quimera-formulario>
                    <QInput label="Nº de entidad" {...uiProps("id")} ref={focus} />
                    <CamposBanco uiProps={uiProps} />
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
