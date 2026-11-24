import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useState } from "react";
import { SelectorHorario } from "../../horario/SelectorHorario.tsx";
import { fechaApi } from "../../comun/dominio.ts";
import { GeneracionCalendario, ResultadoGeneracion } from "../diseño.ts";
import { generacionVacia, motivoGeneracionNoValida } from "../dominio.ts";
import { postGenerarCalendario } from "../infraestructura.ts";

/**
 * Generar el calendario laboral: los días de lunes a viernes con el horario laboral y los
 * sábados y domingos con el suyo (sin él, no laborables). Los días que ya estaban se sustituyen.
 */
export const GenerarCalendario = ({
    onGenerado,
    onCancelar,
}: {
    onGenerado: (resultado: ResultadoGeneracion) => void;
    onCancelar: () => void;
}) => {
    const [g, setG] = useState<GeneracionCalendario>(() => generacionVacia(new Date()));
    const motivo = motivoGeneracionNoValida(g, fechaApi(new Date()));

    const cambiar = (campo: keyof GeneracionCalendario) => (valor: string) => setG((p) => ({ ...p, [campo]: valor }));

    const generar_ = useCallback(async () => {
        onGenerado(await postGenerarCalendario(g));
    }, [g, onGenerado]);

    const [generar, cancelar] = useForm(generar_, onCancelar);

    return (
        <QModal abierto={true} nombre="generarCalendario" titulo="Generar calendario" onCerrar={cancelar}>
            <div className="GenerarCalendario">
                <quimera-formulario>
                    <QDate label="Desde" nombre="desde" valor={g.desde} onChange={cambiar("desde")} />
                    <QDate label="Hasta" nombre="hasta" valor={g.hasta} onChange={cambiar("hasta")} />
                    <SelectorHorario label="Horario laboral (lunes a viernes)" nombre="horarioLaboralId"
                        valor={g.horarioLaboralId} onChange={(o) => cambiar("horarioLaboralId")(o?.valor ?? "")} />
                    <SelectorHorario label="Horario del sábado" nombre="horarioSabadoId" opcional
                        valor={g.horarioSabadoId} onChange={(o) => cambiar("horarioSabadoId")(o?.valor ?? "")} />
                    <SelectorHorario label="Horario del domingo" nombre="horarioDomingoId" opcional
                        valor={g.horarioDomingoId} onChange={(o) => cambiar("horarioDomingoId")(o?.valor ?? "")} />
                </quimera-formulario>
                <p className="aviso-generar">
                    {motivo ?? "Sin horario de sábado o de domingo, esos días quedan como no laborables. Los días que ya estaban generados se sustituyen."}
                </p>
                <div className="botones maestro-botones">
                    <QBoton onClick={generar} deshabilitado={!!motivo}>Generar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
