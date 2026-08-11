import { TarjetaLineaVenta } from "#/ventas/comun/componentes/TarjetaLineaVenta.tsx";
import { LineaFactura as Linea } from "../../diseño.ts";

export const TarjetaLinea = ({
  linea,
  cantidadEditable = false,
  onCambioCantidad,
}: {
  linea: Linea;
  cantidadEditable?: boolean;
  onCambioCantidad?: (linea: Linea, cantidad: number) => void;
}) => (
  <TarjetaLineaVenta
    linea={linea}
    cantidadEditable={cantidadEditable}
    onCambioCantidad={onCambioCantidad}
  />
);
