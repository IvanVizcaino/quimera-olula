import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Epigrafe } from "../diseño.ts";
import { etiquetaEpigrafe } from "../dominio.ts";
import { deleteEpigrafe } from "../infraestructura.ts";

export const BorrarEpigrafe = ({
    publicar,
    epigrafe,
}: {
    epigrafe: Epigrafe;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteEpigrafe(epigrafe.id);
        publicar("epigrafe_borrado", epigrafe);
    }, [publicar, epigrafe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarEpigrafe"
            abierto={true}
            titulo="Borrar subgrupo"
            mensaje={`¿Confirma borrar ${etiquetaEpigrafe(epigrafe)}? Solo es posible si no tiene cuentas asociadas.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
