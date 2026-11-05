import {
    CriterioOrdenInforme,
    SentidoOrdenInforme,
} from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { admiteOpcionesDeDetalle } from "../dominio.ts";
import { postLibroDiario } from "../infraestructura.ts";
import { metaNuevoLibroDiario, nuevoLibroDiarioInicial } from "./crear.ts";

export const CrearLibroDiario = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario cada vez que cambia la
    // identidad del inicial, así que pasarlo en línea entra en bucle.
    const inicial = useMemo(
        () => nuevoLibroDiarioInicial(ejercicioId),
        [ejercicioId]
    );

    const {
        modelo: informe,
        uiProps,
        valido,
    } = useModelo(metaNuevoLibroDiario, inicial);

    const crear_ = useCallback(async () => {
        const id = await postLibroDiario(informe);
        publicar("informe_creado", id);
    }, [informe, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_informe_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    const conDetalle = admiteOpcionesDeDetalle(informe);

    return (
        <QModal
            abierto={true}
            nombre="crearLibroDiario"
            titulo="Nuevo libro diario"
            onCerrar={cancelar}
        >
            <div className="CrearLibroDiario">
                <quimera-formulario>
                    <QInput
                        label="Descripción"
                        {...uiProps("descripcion")}
                        ref={focus}
                    />
                    <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                    <QDate
                        label="Desde fecha"
                        {...uiProps("fechaDesde")}
                        opcional
                    />
                    <QDate
                        label="Hasta fecha"
                        {...uiProps("fechaHasta")}
                        opcional
                    />
                    <QCheckbox
                        label="Todos los asientos"
                        {...uiProps("todosAsientos")}
                    />
                    <QInput
                        label="Desde asiento Nº"
                        {...uiProps("asientoDesde")}
                        soloLectura={informe.todosAsientos}
                        opcional
                    />
                    <QInput
                        label="Hasta asiento Nº"
                        {...uiProps("asientoHasta")}
                        soloLectura={informe.todosAsientos}
                        opcional
                    />
                    <QCheckbox
                        label="Todas las subcuentas"
                        {...uiProps("todasSubcuentas")}
                    />
                    <QInput
                        label="Desde subcuenta Nº"
                        {...uiProps("subcuentaDesde")}
                        soloLectura={informe.todasSubcuentas}
                        opcional
                    />
                    <QInput
                        label="Hasta subcuenta Nº"
                        {...uiProps("subcuentaHasta")}
                        soloLectura={informe.todasSubcuentas}
                        opcional
                    />
                    <QCheckbox
                        label="Resumen mensual"
                        {...uiProps("resumenMensual")}
                    />
                    <QCheckbox
                        label="Datos de I.V.A."
                        {...uiProps("datosIva")}
                        soloLectura={!conDetalle}
                    />
                    <QCheckbox
                        label="Agrupar por meses"
                        {...uiProps("agruparMeses")}
                        soloLectura={!conDetalle}
                    />
                    <CriterioOrdenInforme
                        label="Criterio 1"
                        {...uiProps("orden1")}
                    />
                    <SentidoOrdenInforme
                        label="Orden 1"
                        {...uiProps("tipoOrden1")}
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
