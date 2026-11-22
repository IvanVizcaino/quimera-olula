import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposGrupo } from "../detalle/CamposGrupo.tsx";
import {
    metaNuevoGrupoContableAmortizacion,
    nuevoGrupoContableAmortizacionVacio,
} from "../dominio.ts";
import { postGrupoContableAmortizacion } from "../infraestructura.ts";

export const CrearGrupoContableAmortizacion = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoGrupoContableAmortizacionVacio, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevoGrupoContableAmortizacion, inicial);

    const crear_ = useCallback(async () => {
        const id = await postGrupoContableAmortizacion(modelo, ejercicioActual());
        publicar("grupo_creado", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_grupo_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearGrupoContableAmortizacion"
            titulo="Nuevo grupo contable de amortización"
            onCerrar={cancelar}
        >
            <div className="CrearGrupoContableAmortizacion">
                <quimera-formulario>
                    <QInput label="Código" {...uiProps("id")} ref={focus} />
                    <CamposGrupo uiProps={uiProps} />
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
