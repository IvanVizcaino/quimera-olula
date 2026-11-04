import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postInventario } from "../../infraestructura.ts";
import { metaNuevoInventario, nuevoInventarioInicial } from "./crear.ts";

export const CrearInventario = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(nuevoInventarioInicial, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoInventario, inicial);

    const crear_ = useCallback(async () => {
        const id = await postInventario(modelo);
        publicar("inventario_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_inventario_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearInventario"
            titulo="Nuevo inventario"
            onCerrar={cancelar}
        >
            <div className="CrearInventario">
                <quimera-formulario>
                    <Almacen {...uiProps("almacenId")} />
                    <QInput label="Fecha" {...uiProps("fecha")} />
                    <QInput label="Hora" {...uiProps("hora")} />
                    <QInput label="Observaciones" {...uiProps("observaciones")} />
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
