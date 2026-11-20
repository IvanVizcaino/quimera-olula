import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { metaNuevoPesoMedida, nuevoPesoMedidaVacio } from "../dominio.ts";
import { postPesoMedida } from "../infraestructura.ts";
import { MagnitudPesoMedida } from "../MagnitudPesoMedida.tsx";
import "./CrearPesoMedida.css";

export const CrearPesoMedida = ({ publicar }: { publicar: EmitirEvento }) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevoPesoMedida, nuevoPesoMedidaVacio);

    const crear_ = useCallback(async () => {
        const id = await postPesoMedida(modelo);
        publicar("peso_medida_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_peso_medida_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearPesoMedida"
            titulo="Nueva unidad de peso o medida"
            onCerrar={cancelar}
        >
            <div className="CrearPesoMedida">
                <quimera-formulario>
                    <QInput label="Abreviatura" {...uiProps("id")} maxLength={10} ref={focus} />
                    <QInput label="Descripción" {...uiProps("descripcion")} maxLength={100} />
                    <MagnitudPesoMedida {...uiProps("magnitud")} />
                    <QInput label="Factor de conversión" {...uiProps("factorConversion")} />
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
