import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CuentaSelector } from "#/contabilidad/comun/componentes/CuentaSelector.tsx";
import { postSubcuenta } from "../infraestructura.ts";
import { metaNuevaSubcuenta, nuevaSubcuentaInicial } from "./crear.ts";

export const CrearSubcuenta = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    const inicial = useMemo(
        () => nuevaSubcuentaInicial(ejercicioId),
        [ejercicioId]
    );

    const form = useModelo(metaNuevaSubcuenta, inicial);
    const { modelo: subcuenta, uiProps, valido } = form;

    const crear_ = useCallback(async () => {
        const id = await postSubcuenta(subcuenta);
        publicar("subcuenta_creada", id);
    }, [subcuenta, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_subcuenta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearSubcuenta"
            titulo="Nueva subcuenta"
            onCerrar={cancelar}
        >
            <div className="CrearSubcuenta">
                <quimera-formulario>
                    <QInput
                        label="Ejercicio"
                        nombre="ejercicioId"
                        valor={subcuenta.ejercicioId}
                        soloLectura
                    />
                    <CuentaSelector
                        ejercicioId={ejercicioId}
                        {...uiProps("codigoCuenta")}
                        onChange={(op) =>
                            form.set(
                                { ...subcuenta, codigoCuenta: op?.valor ?? "" },
                                "codigoCuenta",
                            )
                        }
                    />
                    <QInput
                        label="Código subcuenta"
                        {...uiProps("codigo")}
                        ref={focus}
                    />
                    <QInput label="Descripción" {...uiProps("nombre")} />
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
