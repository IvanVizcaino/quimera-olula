import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { Link } from "react-router";
import { OrdenAlmacen } from "../../diseño.ts";
import { postColocacion } from "../../infraestructura.ts";

export const ColocacionOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const { intentar } = useContext(ContextoError);
    const [idOrdenColocacion, setIdOrdenColocacion] = useState<string | null>(null);

    const crearColocacion = useCallback(async () => {
        await intentar(async () => {
            const id = await postColocacion(orden.id);
            setIdOrdenColocacion(id);
        });
    }, [orden.id, intentar]);

    if (idOrdenColocacion) {
        return (
            <QModal
                abierto={true}
                nombre="colocacionCreada"
                titulo="Orden de colocación creada"
                onCerrar={() => publicar("colocacion_creada")}
            >
                <p>Orden de colocación <strong>{idOrdenColocacion}</strong> creada con éxito.</p>
                <p>
                    <Link to={`/almacen/ordenes?id=${idOrdenColocacion}`} onClick={() => publicar("colocacion_creada")}>
                        Ir a la orden de colocación
                    </Link>
                </p>
                <div className="maestro-botones">
                    <QBoton onClick={() => publicar("colocacion_creada")}>Cerrar</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="confirmarColocacion"
            titulo="Crear orden de colocación"
            onCerrar={() => publicar("colocacion_cancelada")}
        >
            <p>Se creará una orden de traspaso para la colocación de esta entrada. ¿Desea continuar?</p>
            <div className="maestro-botones">
                <QBoton variante="borde" onClick={() => publicar("colocacion_cancelada")}>Cancelar</QBoton>
                <QBoton onClick={crearColocacion}>Crear orden de colocación</QBoton>
            </div>
        </QModal>
    );
};
