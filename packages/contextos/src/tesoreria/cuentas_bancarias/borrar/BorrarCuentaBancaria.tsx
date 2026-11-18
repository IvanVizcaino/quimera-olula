import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CuentaBancaria } from "../diseño.js";
import { deleteCuentaBancaria } from "../infraestructura.js";

export const BorrarCuentaBancaria = ({
    publicar,
    cuenta,
}: {
    cuenta: CuentaBancaria;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteCuentaBancaria(cuenta.id);
            publicar("cuenta_borrada", cuenta);
        },
        [publicar, cuenta],
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar],
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentaBancaria"
            abierto={true}
            titulo="Borrar cuenta bancaria"
            mensaje={`¿Está seguro de que desea borrar la cuenta ${cuenta.descripcion || cuenta.iban || cuenta.codigoCuenta}?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
