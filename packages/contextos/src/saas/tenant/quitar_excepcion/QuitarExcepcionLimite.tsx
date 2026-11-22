import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ExcepcionLimite } from "../suscripcion/diseño.js";
import { deleteExcepcionLimite } from "../suscripcion/infraestructura.js";

export const QuitarExcepcionLimite = ({
    publicar,
    idTenant,
    excepcion,
}: {
    publicar: EmitirEvento;
    idTenant: string;
    excepcion: ExcepcionLimite;
}) => {
    const quitar_ = useCallback(
        async () => {
            await deleteExcepcionLimite(idTenant, excepcion.limiteId);
            publicar("excepcion_quitada");
        },
        [publicar, idTenant, excepcion]
    );
    const cancelar_ = useCallback(() => publicar("quitar_excepcion_cancelado"), [publicar]);

    const [quitar, cancelar] = useForm(quitar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="quitarExcepcionLimite"
            abierto={true}
            titulo="Quitar excepción"
            mensaje={`¿Quitar la excepción del límite "${excepcion.limiteId}"?\nVolverá a valer lo que diga el plan.`}
            labelAceptar="Quitar"
            destructivo
            onCerrar={cancelar}
            onAceptar={quitar}
        />
    );
};
