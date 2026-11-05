import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Subcuenta } from "../diseño.ts";
import { etiquetaSubcuenta } from "../dominio.ts";
import { deleteSubcuenta } from "../infraestructura.ts";

export const BorrarSubcuenta = ({
    publicar,
    subcuenta,
}: {
    subcuenta: Subcuenta;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteSubcuenta(subcuenta.id);
        publicar("subcuenta_borrada", subcuenta);
    }, [publicar, subcuenta]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarSubcuenta"
            abierto={true}
            titulo="Borrar subcuenta"
            mensaje={`¿Confirma borrar ${etiquetaSubcuenta(subcuenta)}? Solo es posible si no tiene partidas contables.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
