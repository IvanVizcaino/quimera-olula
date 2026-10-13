import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaNuevoInventario, nuevoInventarioVacio } from "../../dominio.ts";
import { postInventario } from "../../infraestructura.ts";

export const CrearInventario = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoInventarioVacio, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevoInventario, inicial);

    const crear_ = useCallback(async () => {
        const id = await postInventario(modelo);
        publicar("inventario_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_inventario_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearInventario" titulo="Nuevo inventario" onCerrar={cancelar}>
            <quimera-formulario>
                <QInput label="Código inventario" {...uiProps("id")} ref={focus} />
                <Almacen {...uiProps("almacenId")} />
                <QInput label="Fecha" {...uiProps("fecha")} />
                <QInput label="Observaciones" {...uiProps("observaciones")} opcional />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Crear
                </QBoton>
            </div>
        </QModal>
    );
};
