import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { ReciboDeRemesaPago, RemesaPago } from "../../diseño.js";

export const ExcluirReciboRemesaPago = ({
    remesa,
    recibo,
    publicar,
}: {
    remesa: RemesaPago;
    recibo: ReciboDeRemesaPago;
    publicar: EmitirEvento;
}) => {
    const excluir_ = useCallback(
        async () => publicar("excluir_recibo_confirmado"),
        [publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("excluir_recibo_cancelado"),
        [publicar]
    );

    const [excluir, cancelar] = useForm(excluir_, cancelar_);

    const mensaje = [
        `Se quitará el recibo ${recibo.codigo} de la remesa de pago ${remesa.id}.`,
        "",
        "El recibo volverá a pendiente o devuelto según sus movimientos.",
    ].join("\n");

    return (
        <QModalConfirmacion
            nombre="excluir_recibo_remesa_pago"
            abierto={true}
            titulo="Quitar recibo de la remesa"
            mensaje={mensaje}
            onCerrar={cancelar}
            onAceptar={excluir}
            labelAceptar="Quitar"
            destructivo
        />
    );
};
