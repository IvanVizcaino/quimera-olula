import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { Link } from "react-router";

export const SalidaGenerada = ({
    publicar,
    idOrden,
}: {
    publicar: EmitirEvento;
    idOrden: string;
}) => {
    const cerrar = () => publicar("cerrar_confirmacion");

    return (
        <QModal
            nombre="salidaGenerada"
            abierto={true}
            titulo="Salida generada"
            onCerrar={cerrar}
        >
            <div className="mensaje">
                La salida se ha generado correctamente.
            </div>
            <Link to={`/almacen/ordenes?id=${idOrden}`}>
                Ver orden de salida {idOrden}
            </Link>
        </QModal>
    );
};
