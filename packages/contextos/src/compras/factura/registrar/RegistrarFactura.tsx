import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Factura } from "../diseño.ts";

/**
 * Registrar es irreversible: consume número de serie, genera la cartera de
 * pagos y mueve el stock. Por eso se confirma, a diferencia del resto de
 * acciones del detalle.
 */
export const RegistrarFactura = ({
    factura,
    publicar,
}: {
    factura: Factura;
    publicar: EmitirEvento;
}) => {
    const registrar_ = useCallback(async () => {
        publicar("registro_listo");
    }, [publicar]);

    const cancelar_ = useCallback(
        () => publicar("registro_cancelado"),
        [publicar]
    );

    const [registrarFactura, cancelar] = useForm(registrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="registrarFactura"
            abierto={true}
            titulo="Registrar factura"
            mensaje={
                `¿Registrar la factura ${factura.codigo}? Dejará de ser un ` +
                `borrador y se le asignará número definitivo.`
            }
            onCerrar={cancelar}
            onAceptar={registrarFactura}
        />
    );
};
