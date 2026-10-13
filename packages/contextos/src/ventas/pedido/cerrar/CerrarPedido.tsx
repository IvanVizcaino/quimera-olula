import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Pedido } from "../diseño.ts";
import { mensajeCierrePedido, modoCierrePedido } from "../dominio.ts";

/** Eneboo `abrirCerrarPedido`: cierra el pedido o reabre sus líneas cerradas. */
export const CerrarPedido = ({
    pedido,
    publicar,
}: {
    pedido: Pedido;
    publicar: EmitirEvento;
}) => {
    const modo = modoCierrePedido(pedido) ?? "cerrar";

    const aceptar_ = useCallback(
        async () => publicar("cierre_pedido_listo", modo === "cerrar"),
        [publicar, modo]
    );
    const cancelar_ = useCallback(() => publicar("cierre_pedido_cancelado"), [publicar]);
    const [aceptar, cancelar] = useForm(aceptar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarCerrarPedido"
            abierto={true}
            titulo={modo === "cerrar" ? "Cerrar pedido" : "Abrir pedido"}
            mensaje={mensajeCierrePedido(modo)}
            onCerrar={cancelar}
            onAceptar={aceptar}
        />
    );
};
