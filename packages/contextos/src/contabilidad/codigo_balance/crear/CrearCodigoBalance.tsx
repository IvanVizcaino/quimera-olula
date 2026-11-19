import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposCodigoBalance } from "../detalle/CamposCodigoBalance.tsx";
import { postCodigoBalance } from "../infraestructura.ts";
import { metaNuevoCodigoBalance, nuevoCodigoBalanceInicial } from "./crear.ts";

export const CrearCodigoBalance = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoCodigoBalanceInicial, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoCodigoBalance, inicial);

    const crear_ = useCallback(async () => {
        const id = await postCodigoBalance(modelo);
        publicar("codigo_balance_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_codigo_balance_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearCodigoBalance"
            titulo="Nuevo código de balance 2008"
            onCerrar={cancelar}
        >
            <div className="CrearCodigoBalance">
                <quimera-formulario>
                    <QInput label="Código" {...uiProps("id")} ref={focus} />
                    <CamposCodigoBalance uiProps={uiProps} />
                    <QInput label="Descripción balance abreviado" {...uiProps("descripcion4ba")} />
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
