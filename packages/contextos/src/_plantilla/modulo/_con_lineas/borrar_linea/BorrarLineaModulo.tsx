import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LineaModulo, ModLin } from "../diseño.js";
import { deleteLineaModulo } from "../infraestructura.js";

export const BorrarLineaModulo = ({
    modLin,
    linea,
    publicar,
}: {
    modLin: ModLin;
    linea: LineaModulo;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(
        async () => {
            await deleteLineaModulo(modLin.id, linea.id);
            publicar("linea_borrada", linea.id);
        },
        [modLin.id, linea, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_de_linea_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarLineaModulo"
            abierto={true}
            titulo="Borrar línea"
            mensaje={`¿Está seguro de que desea borrar la línea "${linea.campoString}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
