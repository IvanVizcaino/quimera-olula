import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { FormaPago } from "../diseño.ts";
import { etiquetaFormaPago } from "../dominio.ts";
import { deleteFormaPago } from "../infraestructura.ts";

export const BorrarFormaPago = ({
    publicar,
    formaPago,
}: {
    formaPago: FormaPago;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteFormaPago(formaPago.id);
        publicar("forma_pago_borrada", formaPago);
    }, [publicar, formaPago]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarFormaPago"
            abierto={true}
            titulo="Borrar forma de pago"
            mensaje={`¿Confirma borrar ${etiquetaFormaPago(formaPago)} y sus plazos? No se puede borrar si la usan clientes, proveedores o documentos.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
