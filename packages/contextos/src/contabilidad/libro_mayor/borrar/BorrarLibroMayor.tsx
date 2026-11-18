import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LibroMayor } from "../diseño.ts";
import { etiquetaLibroMayor } from "../dominio.ts";
import { deleteLibroMayor } from "../infraestructura.ts";

export const BorrarLibroMayor = ({
    publicar,
    informe,
}: {
    informe: LibroMayor;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteLibroMayor(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLibroMayor"
            abierto={true}
            titulo="Borrar informe"
            mensaje={`¿Confirma borrar ${etiquetaLibroMayor(informe)}? Solo se borra la configuración del informe, no hay datos contables implicados.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
