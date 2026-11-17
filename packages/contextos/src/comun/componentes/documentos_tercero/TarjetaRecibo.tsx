import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import "./DocumentosTercero.css";

/** Tarjeta de un recibo de cobro o de pago en la ficha de su cliente o proveedor. */
export const TarjetaRecibo = ({ codigo, fecha, importe, estado, divisa = "EUR" }: {
    codigo: string;
    fecha: Date | string | null;
    importe: number;
    estado: string;
    divisa?: string;
}) => (
    <div className="TarjetaRecibo">
        <span className="TarjetaRecibo-codigo">{codigo}</span>
        <span>{fecha ? formatearFechaDate(new Date(fecha)) : ""}</span>
        <span className="TarjetaRecibo-importe">{formatearMoneda(importe, divisa)}</span>
        <span className={`TarjetaRecibo-estado estado-${estado}`}>{estado}</span>
    </div>
);
