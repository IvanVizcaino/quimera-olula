import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { UsuarioTenant } from "../diseño.js";
import { deleteUsuarioTenant } from "../infraestructura.js";

export const BorrarUsuarioTenant = ({
    publicar,
    usuario,
}: {
    usuario: UsuarioTenant;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteUsuarioTenant(usuario.id);
            publicar("usuario_borrado", usuario);
        },
        [publicar, usuario]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarUsuarioTenant"
            abierto={true}
            titulo="Borrar usuario tenant"
            mensaje={`¿Está seguro de que desea borrar el usuario "${usuario.nombre}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
