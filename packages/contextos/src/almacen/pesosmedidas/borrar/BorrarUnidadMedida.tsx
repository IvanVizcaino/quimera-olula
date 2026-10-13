import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { UnidadMedida } from "../diseño.ts";
import { deleteUnidadMedida } from "../infraestructura.ts";

export const BorrarUnidadMedida = ({
    publicar,
    activo = false,
    unidad,
}: {
    publicar: (evento: string, payload?: unknown) => void;
    unidad: UnidadMedida;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);

    const borrar = async () => {
        if (unidad.id) {
            await intentar(() => deleteUnidadMedida(unidad.id));
        }
        publicar("unidad_borrada");
    };

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarUnidadMedida"
            abierto={activo}
            titulo="Confirmar borrado"
            mensaje="¿Está seguro de que desea borrar esta unidad de medida?"
            onCerrar={() => publicar("borrado_cancelado")}
            onAceptar={borrar}
        />
    );
};
