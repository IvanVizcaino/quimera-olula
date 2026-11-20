import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaNuevoPlan, nuevoPlanVacio } from "../crear/crear.js";
import { Plan } from "../diseño.js";
import { duplicarPlan } from "../dominio.js";
import { putPlan } from "../infraestructura.js";

/** Pide id y nombre nuevos y crea una copia del plan (sin publicar ni destacar). */
export const DuplicarPlan = ({
    publicar,
    plan,
    idsExistentes,
}: {
    publicar: EmitirEvento;
    plan: Plan;
    idsExistentes: string[];
}) => {
    const meta = useMemo(() => metaNuevoPlan(idsExistentes), [idsExistentes]);
    const { modelo, uiProps, valido } = useModelo(meta, nuevoPlanVacio);

    const duplicar_ = useCallback(
        async () => {
            const copia = await putPlan(duplicarPlan(plan, modelo.id, modelo.nombre));
            publicar("plan_duplicado", copia);
        },
        [plan, modelo, publicar]
    );
    const cancelar_ = useCallback(() => publicar("duplicado_cancelado"), [publicar]);

    const [duplicar, cancelar] = useForm(duplicar_, cancelar_);
    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="duplicarPlan" titulo={`Duplicar el plan ${plan.nombre}`} onCerrar={cancelar}>
            <quimera-formulario>
                <QInput label="Identificador del nuevo plan" {...uiProps("id")} ref={focus} />
                <QInput label="Nombre del nuevo plan" {...uiProps("nombre")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={duplicar} deshabilitado={!valido}>Duplicar</QBoton>
            </div>
        </QModal>
    );
};
