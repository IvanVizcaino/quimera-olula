import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { RegularizacionStock } from "../diseño.ts";
import { deleteRegularizacionStock } from "../infraestructura.ts";

export const BorrarRegularizacionStock = ({
    regularizacion,
    publicar,
}: {
    regularizacion: RegularizacionStock;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteRegularizacionStock(regularizacion.id);
        publicar("regularizacion_borrada", regularizacion);
    }, [regularizacion, publicar]);

    const cancelar_ = useCallback(
        () => publicar("borrado_regularizacion_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarRegularizacionStock"
            abierto={true}
            titulo="Borrar regularización"
            mensaje={`¿Borrar la regularización a ${regularizacion.cantidadFinal} del ${regularizacion.fecha} ${regularizacion.hora}? El stock se recalculará desde la regularización anterior.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
