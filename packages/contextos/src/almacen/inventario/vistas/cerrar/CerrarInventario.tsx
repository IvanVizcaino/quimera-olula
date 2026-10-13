import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Inventario } from "../../diseño.ts";
import { patchCerrarInventario } from "../../infraestructura.ts";

export const CerrarInventario = ({
    inventario,
    publicar,
}: {
    inventario: Inventario;
    publicar: EmitirEvento;
}) => {
    const cerrar_ = useCallback(async () => {
        const res = await patchCerrarInventario(inventario.id);
        publicar("inventario_cerrado", res);
    }, [inventario.id, publicar]);

    const cancelar_ = useCallback(() => publicar("cierre_inventario_cancelado"), [publicar]);

    const [cerrar, cancelar] = useForm(cerrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarCerrarInventario"
            abierto={true}
            titulo="Cerrar inventario"
            mensaje={`¿Cerrar el inventario "${inventario.id}"? No podrá añadir líneas ni regularizar después.`}
            onCerrar={cancelar}
            onAceptar={cerrar}
        />
    );
};
