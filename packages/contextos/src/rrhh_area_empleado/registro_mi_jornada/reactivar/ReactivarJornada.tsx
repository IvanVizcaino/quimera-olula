import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext } from "react";
import { RegistroJornada } from "../diseño.ts";
import { patchReactivarJornada } from "../infraestructura.ts";
import { metaReactivacionJornada, reactivacionJornadaInicial } from "./diseño.ts";

export const ReactivarJornada = ({
    publicar,
    jornada,
}: {
    publicar: EmitirEvento;
    jornada: RegistroJornada;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaReactivacionJornada, reactivacionJornadaInicial);
    const { intentar } = useContext(ContextoError);

    const reactivar = useCallback(async () => {
        await intentar(() =>
            patchReactivarJornada(jornada.id, {
                horaFin: modelo.horaFin,
            })
        );
        publicar("jornada_reactivada");
    }, [modelo, publicar, jornada.id, intentar]);

    const cancelar = useCallback(() => publicar("reactivacion_cancelada"), [publicar]);

    return (
        <QModal
            abierto={true}
            nombre="reactivarJornada"
            titulo="Reactivar jornada"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Hora de fin de pausa" {...uiProps("horaFin")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={reactivar} deshabilitado={!valido}>
                    Reactivar
                </QBoton>
            </div>
        </QModal>
    );
};
