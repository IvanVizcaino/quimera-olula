import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { Composicion } from "../diseño.ts";
import { deleteComposicion } from "../infraestructura.ts";

export const BorrarComposicion = ({
    publicar,
    activo = false,
    composicion,
}: {
    publicar: (evento: string, payload?: unknown) => void;
    composicion: Composicion;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);

    const borrar = async () => {
        if (composicion.id) {
            await intentar(() => deleteComposicion(composicion.id));
        }
        publicar("composicion_borrada");
    };

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarComposicion"
            abierto={activo}
            titulo="Confirmar borrado"
            mensaje="¿Está seguro de que desea borrar esta composición? Se eliminarán también sus líneas y movimientos de stock."
            onCerrar={() => publicar("borrado_cancelado")}
            onAceptar={borrar}
        />
    );
};
