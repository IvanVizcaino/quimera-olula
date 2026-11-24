import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";

/** Confirmación de borrado; publica `entidad_borrada` o `borrado_cancelado`. */
export const BorrarSimple = ({
    publicar,
    titulo,
    mensaje,
    borrar,
}: {
    publicar: EmitirEvento;
    titulo: string;
    mensaje: string;
    borrar: () => Promise<void>;
}) => {
    const borrar_ = useCallback(async () => {
        await borrar();
        publicar("entidad_borrada");
    }, [publicar, borrar]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [aceptar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarProduccion"
            abierto={true}
            titulo={titulo}
            mensaje={mensaje}
            onCerrar={cancelar}
            onAceptar={aceptar}
        />
    );
};
