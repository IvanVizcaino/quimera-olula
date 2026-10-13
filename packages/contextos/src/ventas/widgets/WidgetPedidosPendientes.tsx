import { useEffect, useState } from "react";
import { Link } from "react-router";
import "#/comun/widgets/WidgetResumen.css";
import {
    cargarModeloWidgetPedidosPendientes,
    ModeloWidgetPedidosPendientes,
    modeloWidgetPedidosPendientesInicial,
} from "./dominio_pedidos_pendientes.ts";

export const WidgetPedidosPendientes = () => {
    const [modelo, setModelo] = useState<ModeloWidgetPedidosPendientes>(
        modeloWidgetPedidosPendientesInicial
    );

    useEffect(() => {
        let cancelado = false;

        cargarModeloWidgetPedidosPendientes()
            .then((siguiente) => {
                if (cancelado) return;
                setModelo(siguiente);
            })
            .catch((error) => {
                if (cancelado) return;
                console.error("Error cargando pedidos pendientes", error);
                setModelo((previo) => ({ ...previo, estado: "listo" }));
            });

        return () => {
            cancelado = true;
        };
    }, []);

    if (modelo.estado === "cargando") {
        return <div>Cargando pedidos pendientes…</div>;
    }

    return (
        <div className="widget-resumen">
            <h3 className="widget-resumen__titulo">Pedidos de venta</h3>
            {modelo.totalPendientes === 0 ? (
                <div className="widget-resumen__vacio">
                    No hay pedidos pendientes de servir
                </div>
            ) : (
                <>
                    <div className="widget-resumen__valor">
                        {modelo.totalPendientes}
                    </div>
                    <div className="widget-resumen__detalle">
                        pendientes de servir o parcialmente servidos
                    </div>
                </>
            )}
            <div className="widget-resumen__acciones">
                <Link className="widget-resumen__enlace" to={modelo.urlVer}>
                    Ver pedidos
                </Link>
            </div>
        </div>
    );
};
