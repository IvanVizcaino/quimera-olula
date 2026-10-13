import { formatearMoneda } from "@olula/lib/dominio.js";
import { TotalesReciboListado } from "../totales_recibo.ts";
import "./TotalesListadoRecibos.css";

type Props = {
    totales: TotalesReciboListado | null;
    cargando?: boolean;
};

export const TotalesListadoRecibos = ({ totales, cargando = false }: Props) => {
    if (!totales && !cargando) return null;

    const importeTotal = totales?.importeTotal ?? 0;
    const importePagado = totales?.importePagado ?? 0;
    const importePendiente = totales?.importePendiente ?? 0;

    return (
        <div className="totales-listado-recibos" aria-busy={cargando}>
            <div className="totales-listado-recibos-item">
                <span className="totales-listado-recibos-etiqueta">Importe total</span>
                <span className="totales-listado-recibos-valor">
                    {formatearMoneda(importeTotal, "EUR")}
                </span>
            </div>
            <div className="totales-listado-recibos-item">
                <span className="totales-listado-recibos-etiqueta">Pagado</span>
                <span className="totales-listado-recibos-valor">
                    {formatearMoneda(importePagado, "EUR")}
                </span>
            </div>
            <div className="totales-listado-recibos-item">
                <span className="totales-listado-recibos-etiqueta">Pendiente</span>
                <span className="totales-listado-recibos-valor">
                    {formatearMoneda(importePendiente, "EUR")}
                </span>
            </div>
        </div>
    );
};
