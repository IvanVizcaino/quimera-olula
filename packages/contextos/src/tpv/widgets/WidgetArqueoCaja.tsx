import { useEffect, useState } from "react";
import { Link } from "react-router";
import "#/comun/widgets/WidgetResumen.css";
import {
    cargarModeloWidgetArqueoCaja,
    ModeloWidgetArqueoCaja,
    modeloWidgetArqueoCajaInicial,
} from "./dominio_arqueo_caja.ts";

export const WidgetArqueoCaja = () => {
    const [modelo, setModelo] = useState<ModeloWidgetArqueoCaja>(
        modeloWidgetArqueoCajaInicial
    );

    useEffect(() => {
        let cancelado = false;

        cargarModeloWidgetArqueoCaja()
            .then((siguiente) => {
                if (cancelado) return;
                setModelo(siguiente);
            })
            .catch((error) => {
                if (cancelado) return;
                console.error("Error cargando arqueo TPV", error);
                setModelo((previo) => ({ ...previo, estado: "listo" }));
            });

        return () => {
            cancelado = true;
        };
    }, []);

    if (modelo.estado === "cargando") {
        return <div>Cargando arqueo de caja…</div>;
    }

    return (
        <div className="widget-resumen">
            <h3 className="widget-resumen__titulo">Caja TPV</h3>
            {!modelo.arqueoAbiertoId ? (
                <div className="widget-resumen__vacio">
                    No hay arqueo abierto en tu punto de venta
                </div>
            ) : (
                <>
                    <div className="widget-resumen__detalle">
                        Arqueo abierto{" "}
                        <strong>{modelo.codigoArqueo}</strong>
                    </div>
                    <ul className="widget-resumen__lista">
                        <li className="widget-resumen__fila">
                            <span>Efectivo</span>
                            <strong>{modelo.textoEfectivo}</strong>
                        </li>
                        <li className="widget-resumen__fila">
                            <span>Tarjeta</span>
                            <strong>{modelo.textoTarjeta}</strong>
                        </li>
                    </ul>
                </>
            )}
            <div className="widget-resumen__acciones">
                <Link
                    className="widget-resumen__enlace"
                    to={
                        modelo.arqueoAbiertoId
                            ? modelo.urlArqueo
                            : modelo.urlMaestro
                    }
                >
                    {modelo.arqueoAbiertoId ? "Ir al arqueo" : "Ver arqueos"}
                </Link>
            </div>
        </div>
    );
};
