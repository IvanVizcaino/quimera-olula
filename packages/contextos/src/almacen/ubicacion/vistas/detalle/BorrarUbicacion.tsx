import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Ubicacion } from "../../diseño.ts";
import { deleteUbicacion } from "../../infraestructura.ts";

export const BorrarUbicacion = ({
    publicar,
    ubicacion,
}: {
    publicar: EmitirEvento;
    ubicacion: Ubicacion;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteUbicacion(ubicacion.id);
        publicar("ubicacion_borrada", ubicacion);
    }, [publicar, ubicacion]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarUbicacion"
            abierto={true}
            titulo="Borrar ubicación"
            mensaje={`¿Está seguro de que desea borrar la ubicación "${ubicacion.codigo}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
