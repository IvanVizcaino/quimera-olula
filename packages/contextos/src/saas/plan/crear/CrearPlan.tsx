import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Catalogo } from "../../catalogo/diseño.js";
import { planNuevo } from "../dominio.js";
import { putPlan } from "../infraestructura.js";
import { metaNuevoPlan, nuevoPlanVacio } from "./crear.js";

/** Modal de alta de plan: id y nombre; el resto parte de un plan vacío que se completa en el detalle. */
export const CrearPlan = ({
    publicar,
    catalogo,
    idsExistentes,
}: {
    publicar: EmitirEvento;
    catalogo: Catalogo;
    idsExistentes: string[];
}) => {
    const meta = useMemo(() => metaNuevoPlan(idsExistentes), [idsExistentes]);
    const { modelo, uiProps, valido } = useModelo(meta, nuevoPlanVacio);

    const crear_ = useCallback(
        async () => {
            const plan = await putPlan(planNuevo(modelo.id, modelo.nombre, catalogo));
            publicar("plan_creado", plan);
        },
        [modelo, catalogo, publicar]
    );
    const cancelar_ = useCallback(() => publicar("alta_de_plan_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);
    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearPlan" titulo="Nuevo plan" onCerrar={cancelar}>
            <quimera-formulario>
                <QInput label="Identificador" {...uiProps("id")} ref={focus} />
                <QInput label="Nombre" {...uiProps("nombre")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>Crear</QBoton>
            </div>
        </QModal>
    );
};
