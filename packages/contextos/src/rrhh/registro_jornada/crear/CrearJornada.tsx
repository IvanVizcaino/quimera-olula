import { Empleado } from "#/rrhh/comun/componentes/Empleado.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext } from "react";
import { postJornada } from "../infraestructura.ts";
import { metaNuevaJornada, nuevaJornadaFormInicial } from "./diseño.ts";

export const CrearJornada = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevaJornada, nuevaJornadaFormInicial);
    const { intentar } = useContext(ContextoError);

    const crear = useCallback(async () => {
        const idJornada = await intentar(() =>
            postJornada({
                empleadoId: modelo.empleadoId,
                fecha: modelo.fecha.toISOString().split("T")[0],
                horaEntrada: modelo.horaEntrada || null,
                horaSalida: modelo.horaSalida || null,
                observaciones: modelo.observaciones || null,
            })
        );
        publicar("jornada_creada", idJornada);
    }, [modelo, publicar, intentar]);

    const cancelar = useCallback(() => publicar("creacion_de_jornada_cancelada"), [publicar]);

    return (
        <QModal
            abierto={true}
            nombre="crearJornada"
            titulo="Nueva jornada"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Empleado label="Empleado" {...uiProps("empleadoId", "nombre")} />
                <QInput label="Fecha" {...uiProps("fecha")} />
                <QInput label="Hora de entrada" {...uiProps("horaEntrada")} />
                <QInput label="Hora de salida" {...uiProps("horaSalida")} />
                <QInput label="Observaciones" {...uiProps("observaciones")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Crear
                </QBoton>
            </div>
        </QModal>
    );
};
