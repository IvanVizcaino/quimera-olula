import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { PuntoVentaTpv } from "../diseño.ts";
import { deletePuntoVentaTpv } from "../infraestructura.ts";

export const BorrarPuntoVentaTpv = ({
    publicar,
    activo = false,
    punto,
}: {
    publicar: (evento: string, payload?: unknown) => void;
    punto: PuntoVentaTpv;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);

    const borrar = async () => {
        if (punto.id) {
            await intentar(() => deletePuntoVentaTpv(punto.id));
        }
        publicar("punto_borrado");
    };

    return (
        <QModalConfirmacion
            nombre="confirmarBorrarPuntoVentaTpv"
            abierto={activo}
            titulo="Confirmar borrado"
            mensaje="¿Está seguro de que desea borrar este punto de venta?"
            onCerrar={() => publicar("borrado_cancelado")}
            onAceptar={borrar}
        />
    );
};
