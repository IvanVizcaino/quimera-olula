import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Inventario } from "../../diseño.ts";
import { deleteInventario } from "../../infraestructura.ts";

export const BorrarInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteInventario(inventario.id);
        publicar("inventario_borrado", inventario);
    }, [inventario, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarInventario"
            abierto={true}
            titulo="Borrar inventario"
            mensaje={`¿Borrar el inventario ${inventario.id}? Se borrarán sus líneas y se recalculará el stock de sus artículos.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
