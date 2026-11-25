import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { CabeceraPlanProduccion } from "../diseño.ts";
import { deletePlanProduccion } from "../infraestructura.ts";

export const BorrarPlanProduccion = ({
    publicar,
    plan,
}: {
    plan: CabeceraPlanProduccion;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deletePlanProduccion(plan.id);
        publicar("plan_borrado", plan);
    }, [publicar, plan]);

    const cancelar_ = useCallback(() => publicar("borrado_de_plan_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPlanProduccion"
            abierto={true}
            titulo="Borrar plan de producción"
            mensaje={`¿Está seguro de que desea borrar el plan ${plan.id} - ${plan.descripcion}?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
