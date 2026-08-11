import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Empresa } from "../diseño.js";
import { deleteEmpresa } from "../infraestructura.js";

export const BorrarEmpresa = ({
    publicar,
    empresa,
}: {
    empresa: Empresa;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteEmpresa(empresa.id);
            publicar("empresa_borrada", empresa);
        },
        [publicar, empresa],
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar],
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarEmpresa"
            abierto={true}
            titulo="Borrar empresa"
            mensaje={`¿Está seguro de que desea borrar la empresa ${empresa.nombre}?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
