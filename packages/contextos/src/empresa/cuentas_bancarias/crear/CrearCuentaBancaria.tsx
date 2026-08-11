import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postCuentaBancaria } from "../infraestructura.js";
import "./CrearCuentaBancaria.css";
import { metaNuevaCuentaBancaria, nuevaCuentaBancariaInicial } from "./crear.js";

export const CrearCuentaBancaria = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo: cuenta, uiProps, valido } = useModelo(
        metaNuevaCuentaBancaria,
        nuevaCuentaBancariaInicial(),
    );

    const crear_ = useCallback(
        async () => {
            const id = await postCuentaBancaria(cuenta);
            publicar("cuenta_creada", id);
        },
        [cuenta, publicar],
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_cuenta_cancelada"),
        [publicar],
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="mostrar"
            titulo="Crear cuenta bancaria"
            onCerrar={cancelar}
        >
            <div className="CrearCuentaBancaria">
                <quimera-formulario>
                    <QInput label="Descripción" {...uiProps("descripcion")} ref={focus} />
                    <QInput label="Código de cuenta" {...uiProps("codigoCuenta")} />
                    <QInput label="País" {...uiProps("paisId")} />
                    <QInput label="IBAN" {...uiProps("iban")} />
                    <QInput label="BIC / SWIFT" {...uiProps("bic")} />
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
