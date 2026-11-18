import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Amortizacion } from "../diseño.ts";
import { etiquetaAmortizacion } from "../dominio.ts";
import { deleteAmortizacion } from "../infraestructura.ts";

export const BorrarAmortizacion = ({
    publicar,
    amortizacion,
}: {
    amortizacion: Amortizacion;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteAmortizacion(amortizacion.id);
        publicar("amortizacion_borrada", amortizacion);
    }, [publicar, amortizacion]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarAmortizacion"
            abierto={true}
            titulo="Borrar amortización"
            mensaje={`¿Confirma borrar ${etiquetaAmortizacion(amortizacion)}? No se puede borrar si tiene dotaciones o regularizaciones.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
