import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { DatosEjercicio as Datos, Ejercicio } from "#/contabilidad/ejercicio/diseño.ts";
import { cambiosDatosEjercicio, datosEjercicio, metaDatosEjercicio } from "#/contabilidad/ejercicio/dominio.ts";
import { patchDatosEjercicio } from "#/contabilidad/ejercicio/infraestructura.ts";

/** Cabecera editable de `ejercicios.ui`: Código (no se cambia) y Nombre en
 * una fila; Inicio, Fin y longitud de subcuenta (bloqueada si el ejercicio ya
 * tiene PGC, como ejercicios.qs) en otra. */
export const DatosEjercicio = ({
    ejercicio,
    editable,
    onGuardado,
}: {
    ejercicio: Ejercicio;
    editable: boolean;
    onGuardado: () => Promise<void>;
}) => {
    const inicial = useMemo(() => datosEjercicio(ejercicio), [ejercicio]);

    const guardar = useCallback(async (datos: Datos) => {
        const cambios = cambiosDatosEjercicio(inicial, datos);
        if (Object.keys(cambios).length === 0) return;
        await patchDatosEjercicio(ejercicio.id, cambios);
        await onGuardado();
    }, [ejercicio.id, inicial, onGuardado]);

    const { uiProps } = useModelo(metaDatosEjercicio, inicial, guardar);

    return (
        <>
            <FilaFormulario columnas="1fr 3fr">
                <QInput label="Código" nombre="id" valor={ejercicio.id} soloLectura />
                <QInput label="Nombre" {...uiProps("nombre")} deshabilitado={!editable} />
            </FilaFormulario>
            <FilaFormulario>
                <QDate label="Inicio" {...uiProps("fechaInicio")} deshabilitado={!editable} />
                <QDate label="Fin" {...uiProps("fechaFin")} deshabilitado={!editable} />
                <QInput label="Dígitos de subcuenta" {...uiProps("digitosSubcuenta")}
                    deshabilitado={!editable || ejercicio.tienePgc} />
            </FilaFormulario>
        </>
    );
};
