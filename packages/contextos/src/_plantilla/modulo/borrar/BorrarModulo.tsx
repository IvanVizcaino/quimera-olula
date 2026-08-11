import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Modulo } from "../diseño.js";
import { deleteModulo } from "../infraestructura.js";

export const BorrarModulo = ({
    publicar,
    modulo,
}: {
    modulo: Modulo;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteModulo(modulo.id);
            publicar("modulo_borrado", modulo);
        },
        [publicar, modulo]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_de_modulo_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarModulo"
            abierto={true}
            titulo="Borrar módulo"
            mensaje={`¿Está seguro de que desea borrar el módulo ${modulo.campoString}?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
