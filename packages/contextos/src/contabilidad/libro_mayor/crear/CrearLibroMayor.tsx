import { SentidoOrdenInforme } from "#/contabilidad/comun/componentes/OpcionesLibroDiario.tsx";
import { CriterioOrdenMayor } from "#/contabilidad/comun/componentes/OpcionesLibroMayor.tsx";
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
import { postLibroMayor } from "../infraestructura.ts";
import { metaNuevoLibroMayor, nuevoLibroMayorInicial } from "./crear.ts";

export const CrearLibroMayor = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario cada vez que cambia la
    // identidad del inicial, así que pasarlo en línea entra en bucle.
    const inicial = useMemo(
        () => nuevoLibroMayorInicial(ejercicioId),
        [ejercicioId]
    );

    const {
        modelo: informe,
        uiProps,
        valido,
    } = useModelo(metaNuevoLibroMayor, inicial);

    const crear_ = useCallback(async () => {
        const id = await postLibroMayor(informe);
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
            nombre="crearLibroMayor"
            titulo="Nuevo libro mayor"
            onCerrar={cancelar}
        >
            <div className="CrearLibroMayor">
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
                        label="Saldo inicial"
                        {...uiProps("saldoInicial")}
                    />
                    <QCheckbox
                        label="Excluir partidas a cero"
                        {...uiProps("excluirPartidasCero")}
                    />
                    <CriterioOrdenMayor
                        label="Criterio"
                        {...uiProps("orden")}
                    />
                    <SentidoOrdenInforme
                        label="Orden"
                        {...uiProps("tipoOrden")}
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
