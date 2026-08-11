import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { RegistroJornada } from "../diseño.ts";
import { patchAprobarJornada } from "../infraestructura.ts";

export const AprobarJornada = ({
    publicar,
    jornada,
}: {
    publicar: EmitirEvento;
    jornada: RegistroJornada;
}) => {
    const aprobar_ = useCallback(async () => {
        await patchAprobarJornada([jornada.id]);
        publicar("jornada_aprobada");
    }, [publicar, jornada.id]);

    const cancelar_ = useCallback(() => publicar("aprobacion_cancelada"), [publicar]);

    const [aprobar, cancelar] = useForm(aprobar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="aprobarJornada"
            abierto={true}
            titulo="Aprobar jornada"
            mensaje={`¿Seguro que desea aprobar la jornada del ${formatearFechaDate(jornada.fecha)}?`}
            onCerrar={cancelar}
            onAceptar={aprobar}
        />
    );
};
