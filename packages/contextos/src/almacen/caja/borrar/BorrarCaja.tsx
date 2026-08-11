import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Caja } from "../diseño.ts";
import { deleteCaja } from "../infraestructura.ts";

export const BorrarCaja = ({
    caja,
    publicar,
}: {
    caja: Caja;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteCaja(caja.id);
            publicar("caja_borrada", caja);
        },
        [publicar, caja]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCaja"
            abierto={true}
            titulo="Borrar caja"
            mensaje={`¿Está seguro de que desea borrar la caja "${caja.lpn || caja.id}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
