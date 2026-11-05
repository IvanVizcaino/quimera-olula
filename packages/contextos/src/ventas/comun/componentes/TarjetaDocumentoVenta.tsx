import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { formatearFechaDate, formatearHoraString, formatearMoneda } from "@olula/lib/dominio.ts";
import { ReactNode } from "react";
import { DIVISA_EMPRESA, enDivisaExtranjera } from "../../venta/dominio.ts";
import "./TarjetaDocumentoVenta.css";

export type EstadoDocumento = "cerrado" | "parcial" | "pendiente";

export const TarjetaDocumentoVenta = ({
  codigo,
  nombreCliente,
  fecha,
  hora,
  total,
  estado,
  divisa = "EUR",
  tasaConversion,
  totalDivisaEmpresa,
  etiqueta,
  etiquetaEstado,
}: {
  codigo: string;
  nombreCliente: string;
  fecha: Date;
  hora?: string;
  total: number;
  estado: EstadoDocumento;
  divisa?: string;
  tasaConversion?: number;
  totalDivisaEmpresa?: number;
  etiqueta?: ReactNode;
  /** Píldora de estado en la esquina superior derecha. */
  etiquetaEstado?: EstadoEtiqueta;
}) => {
  const mostrarContravalor =
    enDivisaExtranjera({ divisa_id: divisa }) &&
    totalDivisaEmpresa !== undefined &&
    tasaConversion !== undefined;

  return (
    <QTarjetaGenerica
      avatar={
        <QAvatar
          nombre={nombreCliente || codigo}
          className={
            // Con etiqueta de estado el color lo lleva la etiqueta
            etiquetaEstado ? "tarjeta-doc-avatar" : `tarjeta-doc-avatar estado-${estado}`
          }
        />
      }
      arribaIzquierda={
        <span className="tarjeta-doc-titulo">
          <span className="tarjeta-doc-codigo">
            {codigo}
            {etiqueta}
          </span>
          {nombreCliente && (
            <span className="tarjeta-doc-cliente">{nombreCliente}</span>
          )}
        </span>
      }
      arribaDerecha={etiquetaEstado && <EtiquetaEstado {...etiquetaEstado} />}
      abajoIzquierda={
        fecha
          ? `${formatearFechaDate(new Date(fecha))}${hora ? ` ${formatearHoraString(hora)}` : ""}`
          : ""
      }
      abajoDerecha={
        <span className="tarjeta-doc-importes">
          <span className="tarjeta-doc-total">
            {formatearMoneda(total, divisa)}
          </span>
          {mostrarContravalor && (
            <span className="tarjeta-doc-contravalor">
              {formatearMoneda(totalDivisaEmpresa, DIVISA_EMPRESA)}
            </span>
          )}
        </span>
      }
    />
  );
};
