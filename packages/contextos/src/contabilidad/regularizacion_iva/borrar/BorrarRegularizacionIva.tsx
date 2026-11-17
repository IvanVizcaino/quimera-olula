import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { RegularizacionIva } from "../diseño.ts";
import { etiquetaRegularizacionIva } from "../dominio.ts";
import { deleteRegularizacionIva } from "../infraestructura.ts";

export const BorrarRegularizacionIva = ({
    publicar,
    regularizacion,
}: {
    regularizacion: RegularizacionIva;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteRegularizacionIva(regularizacion.id);
        publicar("regularizacion_iva_borrada", regularizacion);
    }, [publicar, regularizacion]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarRegularizacionIva"
            abierto={true}
            titulo="Borrar regularización de IVA"
            mensaje={`¿Confirma borrar la ${etiquetaRegularizacionIva(regularizacion)}? Se borrará también su asiento y el periodo dejará de estar bloqueado.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
