import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useContext } from "react";
import { PausaJornada, RegistroJornada } from "../diseño.ts";
import { patchJornada } from "../infraestructura.ts";

export const BorrarPausaJornada = ({
    publicar,
    jornada,
    pausa,
}: {
    publicar: EmitirEvento;
    jornada: RegistroJornada;
    pausa: PausaJornada;
}) => {
    const { intentar } = useContext(ContextoError);

    const borrar_ = useCallback(async () => {
        const pausasSinBorrada = jornada.pausas.filter((p) => p.id !== pausa.id);
        await intentar(() =>
            patchJornada(jornada.id, {
                horaEntrada: jornada.horaEntrada,
                horaSalida: jornada.horaSalida,
                observaciones: jornada.observaciones,
                pausas: pausasSinBorrada,
            })
        );
        publicar("pausa_borrada");
    }, [publicar, jornada, pausa, intentar]);

    const cancelar_ = useCallback(() => publicar("borrado_pausa_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPausaJornada"
            abierto={true}
            titulo="Borrar pausa"
            mensaje={`¿Seguro que desea borrar la pausa de ${pausa.horaInicio} — ${pausa.causa}?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
