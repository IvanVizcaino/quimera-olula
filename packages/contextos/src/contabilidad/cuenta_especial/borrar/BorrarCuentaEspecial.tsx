import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CuentaEspecial } from "../diseño.ts";
import { etiquetaCuentaEspecial } from "../dominio.ts";
import { deleteCuentaEspecial } from "../infraestructura.ts";

export const BorrarCuentaEspecial = ({
    publicar,
    cuentaEspecial,
}: {
    cuentaEspecial: CuentaEspecial;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteCuentaEspecial(cuentaEspecial.id);
        publicar("cuenta_especial_borrada", cuentaEspecial);
    }, [publicar, cuentaEspecial]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentaEspecial"
            abierto={true}
            titulo="Borrar cuenta especial"
            mensaje={`¿Confirma borrar ${etiquetaCuentaEspecial(cuentaEspecial)}? Las cuentas y subcuentas que la usen dejarán de tenerla asignada.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
