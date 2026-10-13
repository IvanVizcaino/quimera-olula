import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { Subfamilia } from "../diseño.ts";
import { deleteSubfamilia } from "../infraestructura.ts";

export const BorrarSubfamilia = ({
    publicar,
    activo = false,
    subfamilia,
}: {
    publicar: (evento: string, payload?: unknown) => void;
    subfamilia: Subfamilia;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);

    const borrar = async () => {
        if (subfamilia.id) {
            await intentar(() => deleteSubfamilia(subfamilia.id));
        }
        publicar("subfamilia_borrada");
    };

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarSubfamilia"
            abierto={activo}
            titulo="Confirmar borrado"
            mensaje="¿Está seguro de que desea borrar esta subfamilia?"
            onCerrar={() => publicar("borrado_cancelado")}
            onAceptar={borrar}
        />
    );
};
