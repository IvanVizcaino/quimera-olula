import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext } from "react";
import { PausaJornada, RegistroJornada } from "../diseño.ts";
import { patchJornada } from "../infraestructura.ts";
import { metaPausaForm, pausaFormInicial } from "./diseño.ts";

export const CrearPausaJornada = ({
    publicar,
    jornada,
}: {
    publicar: EmitirEvento;
    jornada: RegistroJornada;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaPausaForm(jornada), pausaFormInicial);
    const { intentar } = useContext(ContextoError);

    const crear = useCallback(async () => {
        const nuevaPausa: PausaJornada = {
            id: crypto.randomUUID(),
            horaInicio: modelo.horaInicio,
            horaFin: modelo.horaFin,
            causa: modelo.causa,
        };
        await intentar(() =>
            patchJornada(jornada.id, {
                horaEntrada: jornada.horaEntrada,
                horaSalida: jornada.horaSalida,
                observaciones: jornada.observaciones,
                pausas: [...jornada.pausas, nuevaPausa],
            })
        );
        publicar("pausa_creada");
    }, [modelo, publicar, jornada, intentar]);

    const cancelar = useCallback(() => publicar("creacion_pausa_cancelada"), [publicar]);

    return (
        <QModal
            abierto={true}
            nombre="crearPausaJornada"
            titulo="Añadir pausa"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Hora de inicio" {...uiProps("horaInicio")} />
                <QInput label="Hora de fin" {...uiProps("horaFin")} />
                <QInput label="Causa" {...uiProps("causa")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Añadir
                </QBoton>
            </div>
        </QModal>
    );
};
