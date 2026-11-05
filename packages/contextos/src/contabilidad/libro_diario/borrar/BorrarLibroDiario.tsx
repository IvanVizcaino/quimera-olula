import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LibroDiario } from "../diseño.ts";
import { etiquetaLibroDiario } from "../dominio.ts";
import { deleteLibroDiario } from "../infraestructura.ts";

export const BorrarLibroDiario = ({
    publicar,
    informe,
}: {
    informe: LibroDiario;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteLibroDiario(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLibroDiario"
            abierto={true}
            titulo="Borrar informe"
            mensaje={`¿Confirma borrar ${etiquetaLibroDiario(informe)}? Solo se borra la configuración del informe, no hay datos contables implicados.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
