import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { RegularizacionIva } from "../diseño.ts";
import { opcionesTrimestre } from "../dominio.ts";
import {
    getSubcuentasRegularizacionIva,
    postRegularizacionIva,
} from "../infraestructura.ts";
import {
    metaNuevaRegularizacionIva,
    nuevaRegularizacionIvaInicial,
} from "./crear.ts";
import "./CrearRegularizacionIva.css";

export const CrearRegularizacionIva = ({
    publicar,
    regularizaciones,
}: {
    publicar: EmitirEvento;
    regularizaciones: RegularizacionIva[];
}) => {
    const inicial = useMemo(
        () => nuevaRegularizacionIvaInicial(regularizaciones),
        [regularizaciones]
    );

    const { modelo, uiProps, valido, set } = useModelo(
        metaNuevaRegularizacionIva,
        inicial
    );

    const modeloActual = useRef(modelo);
    modeloActual.current = modelo;

    // Como co_regiva.qs::init: subcuentas H.P. deudora (IVADEU) y acreedora
    // (IVAACR) del ejercicio, que se vuelven a proponer al cambiarlo.
    const { ejercicioId } = modelo;
    useEffect(() => {
        if (ejercicioId.length !== 4) return;
        let vigente = true;
        getSubcuentasRegularizacionIva(ejercicioId)
            .then((subcuentas) => {
                if (!vigente || modeloActual.current.ejercicioId !== ejercicioId) return;
                set({ ...modeloActual.current, ...subcuentas });
            })
            .catch(() => {});
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ejercicioId]);

    const crear_ = useCallback(async () => {
        const id = await postRegularizacionIva(modelo);
        publicar("regularizacion_iva_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_regularizacion_iva_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearRegularizacionIva"
            titulo="Nueva regularización de IVA"
            onCerrar={cancelar}
        >
            <div className="CrearRegularizacionIva">
                <quimera-formulario>
                    <QInput label="Ejercicio" {...uiProps("ejercicioId")} ref={focus} />
                    <QSelect
                        label="Periodo"
                        opciones={opcionesTrimestre}
                        {...uiProps("trimestre")}
                    />
                    <QDate label="Fecha desde" {...uiProps("fechaInicio")} />
                    <QDate label="Fecha hasta" {...uiProps("fechaFin")} />
                    <QDate
                        label="Fecha del asiento (por defecto, fin del periodo)"
                        {...uiProps("fechaAsiento")}
                    />
                    <QInput
                        label="Subcuenta H.P. deudora"
                        {...uiProps("codigoSubcuentaDeudora")}
                    />
                    <QInput
                        label="Subcuenta H.P. acreedora"
                        {...uiProps("codigoSubcuentaAcreedora")}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Regularizar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
