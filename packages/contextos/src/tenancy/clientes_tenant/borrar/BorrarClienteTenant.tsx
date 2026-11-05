import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ClienteTenant } from "../diseño.js";
import { deleteClienteTenant } from "../infraestructura.js";

export const BorrarClienteTenant = ({
    publicar,
    cliente,
}: {
    cliente: ClienteTenant;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteClienteTenant(cliente.id);
            publicar("cliente_borrado", cliente);
        },
        [publicar, cliente]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarClienteTenant"
            abierto={true}
            titulo="Borrar cliente tenant"
            mensaje={`¿Está seguro de que desea borrar el cliente "${cliente.nombre}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
