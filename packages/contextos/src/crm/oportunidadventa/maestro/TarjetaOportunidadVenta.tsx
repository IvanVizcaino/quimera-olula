import {
  QAvatar,
  QEtiqueta,
  QTarjetaGenerica,
} from "@olula/componentes/index.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.js";
import {
  claseImportePorImporte,
  claseProbabilidadOportunidad,
  estaVencePronto,
} from "../comun/config_visual.ts";
import { OportunidadVenta } from "../diseño.ts";
import "./TarjetaOportunidadVenta.css";

export const TarjetaOportunidadVenta = (oportunidad: OportunidadVenta) => {
  const importe = oportunidad.importe ?? 0;
  const probabilidad = oportunidad.probabilidad ?? 0;
  const vencePronto = estaVencePronto(oportunidad.fecha_cierre);
  const claseImporte = claseImportePorImporte(importe);
  const accionesPendientes = oportunidad.acciones_pendientes;
  const tieneAccionesPendientes =
    typeof accionesPendientes === "number" && accionesPendientes > 0;

  return (
    <article className="TarjetaOportunidadVenta">
      <QTarjetaGenerica
        avatar={
          <QAvatar className={claseProbabilidadOportunidad(probabilidad)}>
            {`${probabilidad}%`}
          </QAvatar>
        }
        arribaIzquierda={
          <div className="tarjeta-descripcion">
            {oportunidad.descripcion || "-"}
          </div>
        }
        arribaDerecha={
          <QEtiqueta className={`tarjeta-total ${claseImporte}`}>
            {formatearMoneda(importe, "EUR")}
          </QEtiqueta>
        }
        abajoIzquierda={
          <div className="tarjeta-linea-secundaria">
            <span className="tarjeta-cliente">
              {oportunidad.nombre_cliente || "-"}
            </span>
            {(vencePronto || tieneAccionesPendientes) && (
              <div className="tarjeta-avisos">
                {vencePronto && (
                  <QEtiqueta variante="error" className="tarjeta-aviso-cliente">
                    Vence pronto
                  </QEtiqueta>
                )}
                {tieneAccionesPendientes && (
                  <QEtiqueta
                    variante="advertencia"
                    className="tarjeta-aviso-cliente"
                  >
                    {`${accionesPendientes} acciones pendientes`}
                  </QEtiqueta>
                )}
              </div>
            )}
          </div>
        }
        abajoDerecha={
          <div className="tarjeta-fecha">
            {oportunidad.fecha_cierre
              ? formatearFechaDate(oportunidad.fecha_cierre)
              : "-"}
          </div>
        }
      />
    </article>
  );
};
