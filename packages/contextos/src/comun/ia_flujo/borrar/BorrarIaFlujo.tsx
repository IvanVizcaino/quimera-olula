import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { IaFlujo } from "../diseño.js";
import { deleteIaFlujo } from "../infraestructura.js";

export const BorrarIaFlujo = ({
    publicar,
    iaFlujo,
}: {
    iaFlujo: IaFlujo;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteIaFlujo(iaFlujo.id);
            publicar("ia_flujo_borrado", iaFlujo);
        },
        [publicar, iaFlujo]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarIaFlujo"
            abierto={true}
            titulo="Borrar flujo de trabajo"
            mensaje={`¿Está seguro de que desea borrar "${iaFlujo.nombre}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
