import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { VentaTpv } from "../diseño.ts";
import { patchEmitirVenta } from "../infraestructura.ts";

export const EmitirVentaTpv = ({
    publicar,
    venta,
}: {
    venta: VentaTpv;
    publicar: EmitirEvento;
}) => {

    const emitir_ = useCallback(
        async () => {
            await patchEmitirVenta(venta.id);
            publicar("emision_confirmada");
        },
        [publicar, venta]
    );

    const cancelar_ = useCallback(
        () => publicar("emision_cancelada"),
        [publicar]
    );

    const [emitir, cancelar] = useForm(emitir_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="emitirVenta"
            abierto={true}
            titulo="Emitir venta"
            mensaje={`Vas a emitir la venta ${venta.codigo}.\nNo podrás modificar las líneas pero podrás asociarle pagos más tarde.\n¿Estás seguro?`}
            onCerrar={cancelar}
            onAceptar={emitir}
        />
    );
};
