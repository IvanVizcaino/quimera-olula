import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import { deleteLineasOrden } from "../../infraestructura.ts";

export const BorrarLineaOrden = ({
    publicar,
    linea,
    orden,
}: {
    publicar: EmitirEvento;
    linea: LineaOrdenAlmacen;
    orden: OrdenAlmacen;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteLineasOrden(orden.id, [linea.id]);
        publicar("linea_borrada", linea.id);
    }, [publicar, linea.id, orden.id]);

    const cancelar_ = useCallback(() => {
        publicar("borrado_de_linea_cancelado");
    }, [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarLineaOrden"
            abierto={true}
            titulo="Confirmar borrado"
            mensaje="¿Está seguro de que desea borrar esta línea?"
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
