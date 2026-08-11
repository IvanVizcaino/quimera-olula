import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postZona } from "../../infraestructura.js";
import { metaNuevaZona, nuevaZonaVacia } from "./crear.js";

export const CrearZona = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo: zona, uiProps, valido } = useModelo(metaNuevaZona, nuevaZonaVacia);

    const crear_ = useCallback(async () => {
        const id = await postZona(zona);
        publicar("zona_creada", id);
    }, [zona, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_zona_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearZona"
            titulo="Crear zona"
            onCerrar={cancelar}
        >
            <div className="CrearZona">
                <quimera-formulario>
                    <QInput label="Código" {...uiProps("codigo")} ref={focus} />
                    <Almacen {...uiProps("almacenId")} />
                    <QInput label="Descripción" {...uiProps("descripcion")} />
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
