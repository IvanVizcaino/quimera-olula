import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";

export const AprobarJornadas = ({
    publicar,
    cantidad,
}: {
    publicar: EmitirEvento;
    cantidad: number;
}) => {
    const aprobar_ = useCallback(async () => {
        publicar("jornadas_aprobadas");
    }, [publicar]);

    const cancelar_ = useCallback(() => publicar("aprobacion_multiple_cancelada"), [publicar]);

    const [aprobar, cancelar] = useForm(aprobar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="aprobarJornadas"
            abierto={true}
            titulo="Aprobar jornadas"
            mensaje={`¿Seguro que desea aprobar las ${cantidad} jornadas seleccionadas?`}
            onCerrar={cancelar}
            onAceptar={aprobar}
        />
    );
};
