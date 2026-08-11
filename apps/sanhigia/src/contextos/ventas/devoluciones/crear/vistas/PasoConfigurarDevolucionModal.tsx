import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { FacturaDevolucion, LineaFacturaDevolucion } from "../../diseño.ts";
import { TablaLineasDevolucion } from "../lineas_devolucion/TablaLineasDevolucion.tsx";

const formatoMoneda = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const PasoConfigurarDevolucionModal = ({
  abierto,
  factura,
  error,
  onCerrar,
  onCambiarFactura,
  onLineasCambiadas,
  onSolicitarConfirmacion,
}: {
  abierto: boolean;
  factura: FacturaDevolucion | null;
  error: string;
  onCerrar: () => void;
  onCambiarFactura: () => void;
  onLineasCambiadas: (lineas: LineaFacturaDevolucion[]) => void;
  onSolicitarConfirmacion: () => void;
}) => {
  const tituloModal = `Devolución factura (${factura?.cabeceraFactura.codigo})`;
  return (
    <QModal
      abierto={abierto}
      nombre="crear_devolucion_factura"
      titulo={tituloModal}
      onCerrar={onCerrar}
    >
      {!!factura && (
        <div className="buscar-factura-devolucion crear-devolucion-factura">
          <div className="crear-devolucion-factura-resumen">
            <h4>{factura.cabeceraFactura.nombrecliente}</h4>
            <h4>
              {factura.cabeceraFactura.fecha
                ? factura.cabeceraFactura.fecha.toLocaleDateString()
                : "-"}
            </h4>
            <h4>{formatoMoneda.format(factura.cabeceraFactura.total)}</h4>
          </div>

          <TablaLineasDevolucion
            lineasIniciales={factura.lineas}
            onLineasCambiadas={onLineasCambiadas}
            onCrear={onSolicitarConfirmacion}
          />

          <div className="botones">
            <QBoton variante="texto" onClick={onCambiarFactura}>
              Cambiar factura
            </QBoton>
            <QBoton tipo="reset" variante="texto" onClick={onCerrar}>
              Cancelar
            </QBoton>
          </div>

          {error && <p className="mensaje-error">{error}</p>}
        </div>
      )}
    </QModal>
  );
};
