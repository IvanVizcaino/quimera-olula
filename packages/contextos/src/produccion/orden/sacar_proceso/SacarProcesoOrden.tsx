import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext } from "react";
import { OrdenProduccion } from "../diseño.ts";
import { postSacarProcesoOrden } from "../infraestructura.ts";

/** «Sacar proceso»: la orden vuelve a pendiente sin lanzar; se recarga con error o sin él. */
export const SacarProcesoOrden = ({
    orden,
    cerrar,
    recargar,
}: {
    orden: OrdenProduccion;
    cerrar: () => void;
    recargar: () => Promise<void>;
}) => {
    const { intentar } = useContext(ContextoError);
    const sacar = async () => {
        try {
            await intentar(() => postSacarProcesoOrden(orden.id));
        } catch {
            // `intentar` ya muestra el error (p. ej. 409) y se recarga la orden.
        } finally {
            cerrar();
            await recargar();
        }
    };

    return (
        <QModalConfirmacion
            nombre="sacarProcesoOrden"
            abierto={true}
            titulo="Sacar proceso"
            mensaje={`Se saca de producción el proceso de la orden ${orden.id}: sus tareas pasan a inactivas y se borran sus movimientos de stock pendientes. La orden vuelve a pendiente y se puede cambiar o lanzar de nuevo.`}
            labelAceptar="Sacar proceso"
            destructivo
            onCerrar={cerrar}
            onAceptar={sacar}
        />
    );
};
