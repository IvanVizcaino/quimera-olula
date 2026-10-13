import { useEffect, useState } from "react";
import { Link } from "react-router";
import "#/comun/widgets/WidgetResumen.css";
import {
    cargarModeloWidgetRecibosCobro,
    ModeloWidgetRecibosCobro,
    modeloWidgetRecibosCobroInicial,
} from "./dominio_recibos_cobro.ts";

export const WidgetRecibosCobro = () => {
    const [modelo, setModelo] = useState<ModeloWidgetRecibosCobro>(
        modeloWidgetRecibosCobroInicial
    );

    useEffect(() => {
        let cancelado = false;

        cargarModeloWidgetRecibosCobro()
            .then((siguiente) => {
                if (cancelado) return;
                setModelo(siguiente);
            })
            .catch((error) => {
                if (cancelado) return;
                console.error("Error cargando recibos de cobro", error);
                setModelo((previo) => ({ ...previo, estado: "listo" }));
            });

        return () => {
            cancelado = true;
        };
    }, []);

    if (modelo.estado === "cargando") {
        return <div>Cargando recibos de cobro…</div>;
    }

    const sinAlertas =
        modelo.pendientesCobro === 0 && modelo.vencidos === 0;

    return (
        <div className="widget-resumen">
            <h3 className="widget-resumen__titulo">Cobros pendientes</h3>
            {sinAlertas ? (
                <div className="widget-resumen__vacio">
                    No hay recibos emitidos pendientes de cobro
                </div>
            ) : (
                <ul className="widget-resumen__lista">
                    {modelo.pendientesCobro > 0 && (
                        <li className="widget-resumen__fila">
                            <span>
                                <strong>{modelo.pendientesCobro}</strong> emitidos
                                sin cobrar
                            </span>
                            <span>{modelo.textoImportePendiente}</span>
                        </li>
                    )}
                    {modelo.vencidos > 0 && (
                        <li className="widget-resumen__fila widget-resumen__alerta">
                            <span>
                                <strong>{modelo.vencidos}</strong> vencidos
                            </span>
                            <Link to={modelo.urlVencidos}>Ver</Link>
                        </li>
                    )}
                </ul>
            )}
            <div className="widget-resumen__acciones">
                <Link className="widget-resumen__enlace" to={modelo.urlPendientes}>
                    Ver recibos de cobro
                </Link>
            </div>
        </div>
    );
};
