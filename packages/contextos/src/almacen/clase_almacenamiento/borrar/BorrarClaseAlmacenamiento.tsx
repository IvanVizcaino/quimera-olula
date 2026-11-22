import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ClaseAlmacenamiento } from "../diseño.ts";
import { deleteClaseAlmacenamiento } from "../infraestructura.ts";

export const BorrarClaseAlmacenamiento = ({
    publicar,
    clase,
}: {
    clase: ClaseAlmacenamiento;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteClaseAlmacenamiento(clase.id);
        publicar("clase_almacenamiento_borrada", clase.id);
    }, [publicar, clase]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarClaseAlmacenamiento"
            abierto={true}
            titulo="Borrar clase de almacenamiento"
            mensaje={`¿Está seguro de que desea borrar la clase de almacenamiento "${clase.codigo}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
