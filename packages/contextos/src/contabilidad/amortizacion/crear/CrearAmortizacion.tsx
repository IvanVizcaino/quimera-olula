import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaNuevaAmortizacion, nuevaAmortizacionVacia, PERIODOS } from "../dominio.ts";
import { postAmortizacion } from "../infraestructura.ts";
import { useOpcionesGrupo } from "./OpcionesGrupo.ts";

export const CrearAmortizacion = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevaAmortizacionVacia, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevaAmortizacion, inicial);
    const grupos = useOpcionesGrupo();

    const crear_ = useCallback(async () => {
        const id = await postAmortizacion(modelo);
        publicar("amortizacion_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_amortizacion_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearAmortizacion" titulo="Nueva amortización"
            onCerrar={cancelar}>
            <div className="CrearAmortizacion">
                <quimera-formulario>
                    <QInput label="Código (vacío: automático)" {...uiProps("id")} />
                    <QInput label="Elemento de inmovilizado" {...uiProps("elemento")} ref={focus} />
                    <QSelect label="Grupo contable" opciones={grupos} {...uiProps("grupoId")} />
                    <QDate label="Fecha de adquisición" {...uiProps("fecha")} />
                    <QDate label="Fecha de inicio" {...uiProps("fechaInicio")} />
                    <QInput label="Valor de adquisición" {...uiProps("valorAdquisicion")} />
                    <QInput label="Valor residual" {...uiProps("valorResidual")} />
                    <QSelect label="Periodo" opciones={PERIODOS} {...uiProps("periodo")} />
                    <QInput label="% anual" {...uiProps("porcentajeAnual")} />
                    <QCheckbox label="Bloqueado" {...uiProps("bloqueado")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>Crear</QBoton>
                </div>
            </div>
        </QModal>
    );
};
