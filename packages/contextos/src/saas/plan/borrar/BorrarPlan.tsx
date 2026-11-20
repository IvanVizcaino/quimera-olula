import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Plan } from "../diseño.js";
import { deletePlan } from "../infraestructura.js";

export const BorrarPlan = ({ publicar, plan }: { publicar: EmitirEvento; plan: Plan }) => {
    const borrar_ = useCallback(
        async () => {
            await deletePlan(plan.id);
            publicar("borrado_confirmado", plan);
        },
        [publicar, plan]
    );
    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPlan"
            abierto={true}
            titulo="Borrar plan"
            mensaje={`¿Seguro que desea borrar el plan "${plan.nombre}"?\nNo se puede si alguna empresa lo tiene o lo tuvo; en ese caso, archívelo.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
