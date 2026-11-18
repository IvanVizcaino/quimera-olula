import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { formatosUbicacion, metaNuevoTipoUbicacion, nuevoTipoUbicacionVacio } from "../dominio.ts";
import { postTipoUbicacion } from "../infraestructura.ts";
import "./CrearTipoUbicacion.css";

export const CrearTipoUbicacion = ({ publicar }: { publicar: EmitirEvento }) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevoTipoUbicacion, nuevoTipoUbicacionVacio);

    const crear_ = useCallback(async () => {
        const id = await postTipoUbicacion(modelo);
        publicar("tipo_ubicacion_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_tipo_ubicacion_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearTipoUbicacion"
            titulo="Crear tipo de ubicación"
            onCerrar={cancelar}
        >
            <div className="CrearTipoUbicacion">
                <quimera-formulario>
                    <QInput label="Código" {...uiProps("codigo")} maxLength={10} ref={focus} />
                    <QInput label="Descripción" {...uiProps("descripcion")} />
                    <QSelect label="Formato" {...uiProps("formato")} opciones={formatosUbicacion} />
                    <QInput label="Capacidad (palés)" {...uiProps("capacidadPalets")} />
                    <QInput label="Peso máx. (kg)" {...uiProps("pesoMax")} />
                    <QInput label="Altura máx. (m)" {...uiProps("alturaMax")} />
                    <QCheckbox label="Multi-referencia" {...uiProps("multiReferencia")} />
                    <QCheckbox label="Multi-lote" {...uiProps("multiLote")} />
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
