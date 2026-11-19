import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ExtraCatalogo } from "../diseño.js";
import { deleteExtra } from "../infraestructura.js";

export const BorrarExtraCatalogo = ({ publicar, extra }: { publicar: EmitirEvento; extra: ExtraCatalogo }) => {
    const borrar_ = useCallback(
        async () => {
            await deleteExtra(extra.id);
            publicar("extra_borrado");
        },
        [publicar, extra]
    );
    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarExtraCatalogo"
            abierto={true}
            titulo="Borrar extra"
            mensaje={`¿Seguro que desea borrar el extra "${extra.nombre}"?\nNo se puede si alguna empresa lo tiene contratado; en ese caso, desactívelo.`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
