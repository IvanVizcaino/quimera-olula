import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext } from "react";
import { RegistroJornada } from "../diseño.ts";
import { patchPausarJornada } from "../infraestructura.ts";
import { metaNuevaPausa, nuevaPausaInicial } from "./diseño.ts";

export const PausarJornada = ({
    publicar,
    jornada,
}: {
    publicar: EmitirEvento;
    jornada: RegistroJornada;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevaPausa, nuevaPausaInicial);
    const { intentar } = useContext(ContextoError);

    const pausar = useCallback(async () => {
        await intentar(() =>
            patchPausarJornada(jornada.id, {
                horaInicio: modelo.horaInicio,
                causa: modelo.causa,
            })
        );
        publicar("jornada_pausada");
    }, [modelo, publicar, jornada.id, intentar]);

    const cancelar = useCallback(() => publicar("pausa_cancelada"), [publicar]);

    return (
        <QModal
            abierto={true}
            nombre="pausarJornada"
            titulo="Pausar jornada"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Hora de inicio" {...uiProps("horaInicio")} />
                <QInput label="Causa" {...uiProps("causa")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={pausar} deshabilitado={!valido}>
                    Pausar
                </QBoton>
            </div>
        </QModal>
    );
};
