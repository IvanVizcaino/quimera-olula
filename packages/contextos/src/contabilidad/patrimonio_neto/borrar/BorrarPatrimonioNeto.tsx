import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PatrimonioNeto } from "../diseño.ts";
import { etiquetaPatrimonioNeto } from "../dominio.ts";
import { deletePatrimonioNeto } from "../infraestructura.ts";

export const BorrarPatrimonioNeto = ({
    publicar,
    informe,
}: {
    informe: PatrimonioNeto;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deletePatrimonioNeto(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPatrimonioNeto"
            abierto={true}
            titulo="Borrar informe"
            mensaje={`¿Confirma borrar ${etiquetaPatrimonioNeto(informe)}? Solo se borra la configuración del informe, no hay datos contables implicados.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
