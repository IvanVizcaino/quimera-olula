import { QBoton } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearMoneda, plugin } from "@olula/lib/dominio.ts";
import { HookModelo } from "@olula/lib/useModelo.js";
import { Venta } from "../diseño.ts";
import {
  DIVISA_EMPRESA,
  enDivisaExtranjera,
  mostrarImporte,
} from "../dominio.ts";
import "./TotalesVenta.css";

interface TotalesVentaProps<T extends Venta> {
  modeloVenta: HookModelo<T>;
  publicar: EmitirEvento;
  /** `ticket`: recuadro a la derecha, un concepto por línea (documentos).
   *  `linea`: todo en una fila, más compacto (TPV). */
  formato?: "ticket" | "linea";
}

export const TotalesVenta = <T extends Venta>({
  modeloVenta,
  publicar,
  formato = "ticket",
}: TotalesVentaProps<T>) => {
  const venta = modeloVenta.modelo;
  const pluginDtoCabeceraVentaActivo =
    plugin("dto_cabecera_venta") === "activo";

  return (
    <div className={`totales-venta totales-venta--${formato}`}>
      {modeloVenta.editable && pluginDtoCabeceraVentaActivo && (
        <div className="botones maestro-botones ">
          <QBoton onClick={() => publicar("descuento_solicitado", venta)}>
            Descuento
          </QBoton>
        </div>
      )}

      {venta.dtoPorcentual !== 0 && (
        <>
          <div className="totales-venta-item">
            <label>Neto s/dto</label>
            <span>{formatearMoneda(venta.netoSinDto, venta.divisa_id)}</span>
          </div>
          <div className="totales-venta-item">
            <label>Dto. ({venta.dtoPorcentual}%)</label>
            <span>
              {formatearMoneda(venta.netoSinDto - venta.neto, venta.divisa_id)}
            </span>
          </div>
        </>
      )}
      <div className="totales-venta-item">
        <label>Base imponible</label>
        <span>{formatearMoneda(venta.neto, venta.divisa_id)}</span>
      </div>
      <div className="totales-venta-item">
        <label>IVA</label>
        <span>{formatearMoneda(venta.total_iva, venta.divisa_id)}</span>
      </div>
      {mostrarImporte(venta.total_recargo) && (
        <div className="totales-venta-item">
          <label>R. Equivalencia</label>
          <span>{formatearMoneda(venta.total_recargo, venta.divisa_id)}</span>
        </div>
      )}
      {mostrarImporte(venta.total_irpf) && (
        <div className="totales-venta-item">
          <label>IRPF</label>
          <span>{formatearMoneda(venta.total_irpf, venta.divisa_id)}</span>
        </div>
      )}
      <div className="totales-venta-item totales-venta-item--total">
        <label>Total</label>
        <span>{formatearMoneda(venta.total, venta.divisa_id)}</span>
      </div>
      {enDivisaExtranjera(venta) && (
        <div className="totales-venta-item totales-venta-item--divisa-empresa">
          <label>{`Total en ${DIVISA_EMPRESA}`}</label>
          <span>
            {formatearMoneda(venta.total_divisa_empresa, DIVISA_EMPRESA)}
          </span>
        </div>
      )}
    </div>
  );
};
