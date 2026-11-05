import { TarjetaDocumentoVenta } from "#/ventas/comun/componentes/TarjetaDocumentoVenta.tsx";
import { aprobado, etiquetaEstadoPresupuesto } from "../dominio.ts";
import { Presupuesto } from "./diseño.ts";

export const TarjetaMaestroPresupuesto = (presupuesto: Presupuesto) => (
  <TarjetaDocumentoVenta
    codigo={presupuesto.codigo}
    nombreCliente={presupuesto.cliente.nombre_cliente}
    fecha={presupuesto.fecha}
    total={presupuesto.total}
    divisa={presupuesto.divisa_id}
    tasaConversion={presupuesto.tasa_conversion}
    totalDivisaEmpresa={presupuesto.total_divisa_empresa}
    estado={aprobado(presupuesto) ? "cerrado" : "pendiente"}
    etiquetaEstado={etiquetaEstadoPresupuesto(presupuesto)}
  />
);
