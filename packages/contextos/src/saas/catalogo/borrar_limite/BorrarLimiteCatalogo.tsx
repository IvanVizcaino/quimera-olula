import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LimiteCatalogo } from "../diseño.js";
import { deleteLimite } from "../infraestructura.js";

export const BorrarLimiteCatalogo = ({ publicar, limite }: { publicar: EmitirEvento; limite: LimiteCatalogo }) => {
    const borrar_ = useCallback(
        async () => {
            await deleteLimite(limite.id);
            publicar("limite_borrado");
        },
        [publicar, limite]
    );
    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLimiteCatalogo"
            abierto={true}
            titulo="Borrar límite"
            mensaje={`¿Seguro que desea borrar el límite "${limite.nombre}"?\nNo se puede si algún plan, módulo o extra lo usa.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
