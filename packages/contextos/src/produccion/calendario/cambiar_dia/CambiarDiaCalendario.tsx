import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useState } from "react";
import { SelectorHorario } from "../../horario/SelectorHorario.tsx";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { DiaCalendario } from "../diseño.ts";
import { patchDiaCalendario } from "../infraestructura.ts";

/** Cambiar el horario de un día del calendario; sin horario, el día pasa a no laborable. */
export const CambiarDiaCalendario = ({
    dia,
    onCambiado,
    onCancelar,
}: {
    dia: DiaCalendario;
    onCambiado: () => void;
    onCancelar: () => void;
}) => {
    const [horarioId, setHorarioId] = useState(dia.horarioId);

    const cambiar_ = useCallback(async () => {
        await patchDiaCalendario(dia.fecha, horarioId);
        onCambiado();
    }, [dia.fecha, horarioId, onCambiado]);

    const [aceptar, cancelar] = useForm(cambiar_, onCancelar);

    return (
        <QModal
            abierto={true}
            nombre="cambiarDiaCalendario"
            titulo={`${dia.descripcion} ${fechaDdMmAaaa(dia.fecha)}`}
            onCerrar={cancelar}
        >
            <div className="CambiarDiaCalendario">
                <quimera-formulario>
                    <SelectorHorario
                        label="Horario (vacío: no laborable)"
                        opcional
                        valor={horarioId}
                        descripcionActual={dia.horario}
                        onChange={(o) => setHorarioId(o?.valor ?? "")}
                    />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={aceptar}>Aceptar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
