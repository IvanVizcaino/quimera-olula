import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Cuenta } from "../diseño.ts";
import { etiquetaCuenta } from "../dominio.ts";
import { deleteCuenta } from "../infraestructura.ts";

export const BorrarCuenta = ({
    publicar,
    cuenta,
}: {
    cuenta: Cuenta;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteCuenta(cuenta.id);
        publicar("cuenta_borrada", cuenta);
    }, [publicar, cuenta]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuenta"
            abierto={true}
            titulo="Borrar cuenta"
            mensaje={`¿Confirma borrar ${etiquetaCuenta(cuenta)}? Solo es posible si no tiene subcuentas asociadas.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
