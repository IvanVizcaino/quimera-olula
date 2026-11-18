import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import {
    FormatoCuentasAnuales,
    NivelDesgloseCuentasAnuales,
    TipoCuentasAnuales,
} from "#/contabilidad/comun/componentes/OpcionesCuentasAnuales.tsx";
import { admiteDesglose } from "../dominio.ts";
import { postCuentasAnuales } from "../infraestructura.ts";
import { metaNuevaCuentasAnuales, nuevaCuentasAnualesInicial } from "./crear.ts";

export const CrearCuentasAnuales = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario cada vez que cambia la
    // identidad del inicial, así que pasarlo en línea entra en bucle.
    const inicial = useMemo(
        () => nuevaCuentasAnualesInicial(ejercicioId),
        [ejercicioId]
    );

    const { modelo: informe, uiProps, valido } = useModelo(
        metaNuevaCuentasAnuales,
        inicial
    );

    const crear_ = useCallback(async () => {
        const id = await postCuentasAnuales(informe);
        publicar("informe_creado", id);
    }, [informe, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_informe_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearCuentasAnuales"
            titulo="Nuevo informe de cuentas anuales"
            onCerrar={cancelar}
        >
            <div className="CrearCuentasAnuales">
                <quimera-formulario>
                    <QInput label="Descripción" {...uiProps("descripcion")} ref={focus} />
                    <TipoCuentasAnuales {...uiProps("tipo")} />
                    <FormatoCuentasAnuales {...uiProps("formato")} />
                    <NivelDesgloseCuentasAnuales
                        {...uiProps("nivelDesglose")}
                        soloLectura={!admiteDesglose(informe.formato)}
                    />
                    <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                    <QDate label="Fecha desde" {...uiProps("fechaDesde")} opcional />
                    <QDate label="Fecha hasta" {...uiProps("fechaHasta")} opcional />
                    <QInput
                        label="Ejercicio anterior"
                        {...uiProps("ejercicioAnteriorId")}
                        opcional
                    />
                    <QDate
                        label="Fecha desde anterior"
                        {...uiProps("fechaDesdeAnterior")}
                        opcional
                    />
                    <QDate
                        label="Fecha hasta anterior"
                        {...uiProps("fechaHastaAnterior")}
                        opcional
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
