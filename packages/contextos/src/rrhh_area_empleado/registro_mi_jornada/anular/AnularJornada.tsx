import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import "./AnularJornada.css";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext } from "react";
import { RegistroJornada } from "../diseño.ts";
import { patchAnularJornada } from "../infraestructura.ts";
import { anulacionJornadaInicial, metaAnulacionJornada } from "./diseño.ts";

export const AnularJornada = ({
    publicar,
    jornada,
}: {
    publicar: EmitirEvento;
    jornada: RegistroJornada;
}) => {
    const { modelo, uiProps } = useModelo(metaAnulacionJornada, anulacionJornadaInicial);
    const { intentar } = useContext(ContextoError);

    const anular = useCallback(async () => {
        await intentar(() =>
            patchAnularJornada(jornada.id, {
                motivo: modelo.motivo || null,
            })
        );
        publicar("jornada_anulada");
    }, [modelo, publicar, jornada.id, intentar]);

    const cancelar = useCallback(() => publicar("anulacion_cancelada"), [publicar]);

    return (
        <QModal
            abierto={true}
            nombre="anularJornada"
            titulo="Anular jornada"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <p>{`¿Seguro que desea anular la jornada del ${formatearFechaDate(jornada.fecha)}?`}</p>
                <QInput label="Motivo (opcional)" {...uiProps("motivo")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={anular}>
                    Anular
                </QBoton>
            </div>
        </QModal>
    );
};
