import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { IaMemoria } from "../diseño.js";
import { deleteIaMemoria } from "../infraestructura.js";

export const BorrarIaMemoria = ({
    publicar,
    iaMemoria,
}: {
    iaMemoria: IaMemoria;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteIaMemoria(iaMemoria.id);
            publicar("ia_memoria_borrada", iaMemoria);
        },
        [publicar, iaMemoria]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarIaMemoria"
            abierto={true}
            titulo="Borrar memoria del asistente"
            mensaje={`¿Está seguro de que desea borrar "${iaMemoria.titulo}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
