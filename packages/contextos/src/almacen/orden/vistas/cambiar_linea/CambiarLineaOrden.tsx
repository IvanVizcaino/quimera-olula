import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import { metaNuevaLinea } from "../../dominio.ts";
import { patchLineaOrden } from "../../infraestructura.ts";

export const CambiarLineaOrden = ({
    publicar,
    linea,
    orden,
}: {
    publicar: EmitirEvento;
    linea: LineaOrdenAlmacen;
    orden: OrdenAlmacen;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevaLinea, linea);

    const guardar_ = useCallback(async () => {
        await patchLineaOrden(orden.id, linea.id, modelo);
        publicar("linea_cambiada", modelo);
    }, [modelo, publicar, orden.id, linea.id]);

    const cancelar_ = useCallback(() => {
        publicar("cambio_de_linea_cancelado");
    }, [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarLineaOrden"
            titulo="Edición de línea"
            onCerrar={cancelar}
        >
            <div className="CambiarLineaOrden">
                <quimera-formulario>
                    <QInput label="SKU" {...uiProps("sku")} />
                    <QInput label="Cantidad prevista" {...uiProps("cantidadPrevista")} />
                    <QInput label="Cantidad real" {...uiProps("cantidadReal")} soloTexto />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={guardar} deshabilitado={!valido}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
