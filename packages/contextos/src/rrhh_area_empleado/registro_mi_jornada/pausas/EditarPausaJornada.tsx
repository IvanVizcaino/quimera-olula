import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useMemo } from "react";
import { PausaJornada, RegistroJornada } from "../diseño.ts";
import { patchJornada } from "../infraestructura.ts";
import { metaPausaForm, pausaFormDesde } from "./diseño.ts";

export const EditarPausaJornada = ({
    publicar,
    jornada,
    pausa,
}: {
    publicar: EmitirEvento;
    jornada: RegistroJornada;
    pausa: PausaJornada;
}) => {
    const pausaInicial = useMemo(() => pausaFormDesde(pausa), [pausa]);
    const { modelo, uiProps, valido } = useModelo(metaPausaForm(jornada, pausa.id), pausaInicial);
    const { intentar } = useContext(ContextoError);

    const guardar = useCallback(async () => {
        const pausaEditada: PausaJornada = {
            id: pausa.id,
            horaInicio: modelo.horaInicio,
            horaFin: modelo.horaFin,
            causa: modelo.causa,
        };
        const pausasActualizadas = jornada.pausas.map((p) =>
            p.id === pausa.id ? pausaEditada : p
        );
        await intentar(() =>
            patchJornada(jornada.id, {
                horaEntrada: jornada.horaEntrada,
                horaSalida: jornada.horaSalida,
                observaciones: jornada.observaciones,
                pausas: pausasActualizadas,
            })
        );
        publicar("pausa_editada");
    }, [modelo, publicar, jornada, pausa, intentar]);

    const cancelar = useCallback(() => publicar("edicion_pausa_cancelada"), [publicar]);

    return (
        <QModal
            abierto={true}
            nombre="editarPausaJornada"
            titulo="Editar pausa"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Hora de inicio" {...uiProps("horaInicio")} />
                <QInput label="Hora de fin" {...uiProps("horaFin")} />
                <QInput label="Causa" {...uiProps("causa")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={guardar} deshabilitado={!valido}>
                    Guardar
                </QBoton>
            </div>
        </QModal>
    );
};
