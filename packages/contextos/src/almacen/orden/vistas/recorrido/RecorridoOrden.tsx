import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useContext, useEffect, useState } from "react";
import { OrdenAlmacen, RecorridoOrden as Recorrido } from "../../diseño.ts";
import { motivoRecorridoVacio, resumenRecorrido, textoAccionParada } from "../../dominio.ts";
import { getRecorridoOrden } from "../../infraestructura.ts";
import "./RecorridoOrden.css";

export const RecorridoOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const { intentar } = useContext(ContextoError);
    const [recorrido, setRecorrido] = useState<Recorrido | null>(null);

    useEffect(() => {
        intentar(async () => setRecorrido(await getRecorridoOrden(orden.id)));
    }, [orden.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const cerrar = () => publicar("recorrido_cerrado");

    return (
        <QModal abierto={true} nombre="recorridoOrden" titulo="Recorrido" onCerrar={cerrar}>
            <div className="RecorridoOrden">
                {recorrido && recorrido.paradas.length === 0 && <p>{motivoRecorridoVacio(recorrido)}</p>}
                {recorrido && recorrido.paradas.length > 0 && (
                    <>
                        <p>{resumenRecorrido(recorrido)}</p>
                        <ol>
                            {recorrido.paradas.map((p) => (
                                <li key={p.secuencia} className="parada">
                                    <div className="parada__ubicacion">
                                        {p.secuencia}. {textoAccionParada[p.accion]} en {p.ubicacion}
                                    </div>
                                    <ul className="parada__lineas">
                                        {p.lineas.map((l) => (
                                            <li key={l.lineaId}>{l.sku}: {l.pendiente}</li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ol>
                    </>
                )}
            </div>
            <div className="maestro-botones">
                <QBoton onClick={cerrar}>Cerrar</QBoton>
            </div>
        </QModal>
    );
};
