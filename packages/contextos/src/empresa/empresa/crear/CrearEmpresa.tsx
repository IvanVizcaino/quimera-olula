import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postEmpresa } from "../infraestructura.js";
import "./CrearEmpresa.css";
import { metaNuevaEmpresa, nuevaEmpresaInicial } from "./crear.js";

export const CrearEmpresa = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo: empresa, uiProps, valido } = useModelo(
        metaNuevaEmpresa,
        nuevaEmpresaInicial(),
    );

    const crear_ = useCallback(
        async () => {
            const id = await postEmpresa(empresa);
            publicar("empresa_creada", id);
        },
        [empresa, publicar],
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_empresa_cancelada"),
        [publicar],
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="mostrar"
            titulo="Crear empresa"
            onCerrar={cancelar}
        >
            <div className="CrearEmpresa">
                <quimera-formulario>
                    <QInput label="Nombre" {...uiProps("nombre")} ref={focus} />
                    <QInput label="CIF / NIF" {...uiProps("cifNif")} />
                    <QInput label="Administrador" {...uiProps("administrador")} />
                    <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
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
