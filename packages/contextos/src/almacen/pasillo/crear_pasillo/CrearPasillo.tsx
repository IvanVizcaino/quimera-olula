import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { Zona } from "../../zona/diseño.ts";
import { accesosPasillo, carasPasillo, metaNuevoPasillo, nuevoPasilloVacio } from "../dominio.ts";
import { postPasillo } from "../infraestructura.ts";
import "./CrearPasillo.css";

export const CrearPasillo = ({
    zona,
    publicar,
}: {
    zona: Zona;
    publicar: EmitirEvento;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevoPasillo, nuevoPasilloVacio);

    const crear_ = useCallback(async () => {
        const id = await postPasillo(zona.id, modelo);
        publicar("pasillo_creado", id);
    }, [modelo, publicar, zona.id]);

    const cancelar_ = useCallback(() => publicar("alta_de_pasillo_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearPasillo"
            titulo={`Crear pasillo en ${zona.codigo}`}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Código" {...uiProps("codigo")} maxLength={10} ref={focus} />
                <QInput label="Orden de recorrido" {...uiProps("orden")} />
                <QSelect label="Caras" {...uiProps("caras")} opciones={carasPasillo} />
                <QInput label="Módulos por cara" {...uiProps("modulos")} />
                <QSelect label="Accesos" {...uiProps("accesos")} opciones={accesosPasillo} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Crear
                </QBoton>
            </div>
        </QModal>
    );
};
