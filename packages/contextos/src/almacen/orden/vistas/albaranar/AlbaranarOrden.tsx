import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { Link } from "react-router";
import { AlbaranGenerado, OrdenAlmacen } from "../../diseño.ts";
import { albaranarOrden } from "../../infraestructura.ts";

export const AlbaranarOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const { intentar } = useContext(ContextoError);
    const [albaranes, setAlbaranes] = useState<AlbaranGenerado[] | null>(null);

    const albaranar = useCallback(async () => {
        await intentar(async () => {
            setAlbaranes(await albaranarOrden(orden.id));
        });
    }, [orden.id, intentar]);

    const cerrar = () => publicar("orden_albaranada");

    if (albaranes) {
        return (
            <QModal
                abierto={true}
                nombre="ordenAlbaranada"
                titulo="Orden albaranada"
                onCerrar={cerrar}
            >
                {albaranes.length === 0 ? (
                    <p>La orden se ha terminado. No tenía líneas de pedido pendientes de albaranar.</p>
                ) : (
                    <>
                        <p>
                            {albaranes.length === 1
                                ? "Se ha generado el albarán:"
                                : `Se han generado ${albaranes.length} albaranes:`}
                        </p>
                        <ul>
                            {albaranes.map(({ id, codigo }) => (
                                <li key={id}>
                                    <Link to={`/ventas/albaran?id=${id}`} onClick={cerrar}>
                                        Albarán {codigo}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <div className="maestro-botones">
                    <QBoton onClick={cerrar}>Cerrar</QBoton>
                </div>
            </QModal>
        );
    }

    return (
        <QModal
            abierto={true}
            nombre="confirmarAlbaranar"
            titulo="Albaranar orden de salida"
            onCerrar={() => publicar("albaranado_cancelado")}
        >
            <p>
                Se generará un albarán por cada pedido de la orden "{orden.descripcion}" y la orden
                quedará terminada. ¿Desea continuar?
            </p>
            <div className="maestro-botones">
                <QBoton variante="borde" onClick={() => publicar("albaranado_cancelado")}>Cancelar</QBoton>
                <QBoton onClick={albaranar}>Albaranar</QBoton>
            </div>
        </QModal>
    );
};
