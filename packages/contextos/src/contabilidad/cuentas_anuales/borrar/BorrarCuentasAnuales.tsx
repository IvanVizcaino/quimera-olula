import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CuentasAnuales } from "../diseño.ts";
import { etiquetaCuentasAnuales } from "../dominio.ts";
import { deleteCuentasAnuales } from "../infraestructura.ts";

export const BorrarCuentasAnuales = ({
    publicar,
    informe,
}: {
    informe: CuentasAnuales;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteCuentasAnuales(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCuentasAnuales"
            abierto={true}
            titulo="Borrar informe"
            mensaje={`¿Confirma borrar ${etiquetaCuentasAnuales(informe)}? Solo se borra la configuración del informe, no hay datos contables implicados.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
