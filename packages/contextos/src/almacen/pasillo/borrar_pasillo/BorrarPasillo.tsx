import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Pasillo } from "../diseño.ts";
import { deletePasillo } from "../infraestructura.ts";

export const BorrarPasillo = ({
    pasillo,
    publicar,
}: {
    pasillo: Pasillo;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deletePasillo(pasillo.id);
        publicar("pasillo_borrado", pasillo.id);
    }, [pasillo.id, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_de_pasillo_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarPasillo"
            abierto={true}
            titulo="Borrar pasillo"
            mensaje={`¿Está seguro de que desea borrar el pasillo "${pasillo.codigo}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
