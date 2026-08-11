import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback } from "react";
import { VentaTpv } from "../diseño.ts";
import { deletePago } from "../infraestructura.ts";

export const BorrarPagoVentaTpv = ({
    venta,
    idPago,
    publicar,
}: {
    venta: VentaTpv;
    idPago: string;
    publicar: EmitirEvento;
}) => {

    const borrar = useCallback(
        async () => {
            await deletePago(venta.id, idPago)
            publicar("pago_borrado", idPago);
        },
        [idPago, publicar, venta.id]
    );

    const cancelar = useCallback(
        () => {
            publicar("borrado_de_pago_cancelado")
        },
        [publicar]
    );

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarPago"
            abierto={true}
            titulo="Borrar pago"
            mensaje="¿Está seguro de que desea borrar este pago?"
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
