import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postPlanProduccion } from "../infraestructura.ts";
import { LONGITUD_MAXIMA_CODIGO, metaNuevoPlanProduccion, nuevoPlanProduccionInicial } from "./crear.ts";
import "./CrearPlanProduccion.css";

/**
 * Modal de alta. Emite "plan_creado" (con el código) o "alta_de_plan_cancelada".
 * El modelo inicial va memoizado para que useModelo no se reinicie en cada render.
 */
export const CrearPlanProduccion = ({ publicar }: { publicar: EmitirEvento }) => {
    const inicial = useMemo(nuevoPlanProduccionInicial, []);
    const { modelo: plan, uiProps, valido } = useModelo(metaNuevoPlanProduccion, inicial);

    const crear_ = useCallback(async () => {
        const id = await postPlanProduccion(plan);
        publicar("plan_creado", id);
    }, [plan, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_plan_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearPlanProduccion" titulo="Nuevo plan de producción" onCerrar={cancelar}>
            <div className="CrearPlanProduccion">
                <quimera-formulario>
                    <QInput label={`Código (máx. ${LONGITUD_MAXIMA_CODIGO})`} {...uiProps("id")} ref={focus} />
                    <QInput label="Descripción" {...uiProps("descripcion")} />
                    <QDate label="Fecha" {...uiProps("fecha")} />
                    <QDate label="Fecha solicitada" {...uiProps("fechaSolicitada")} />
                    <QDate label="Fecha proveedor" {...uiProps("fechaProveedor")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>Crear</QBoton>
                </div>
            </div>
        </QModal>
    );
};
