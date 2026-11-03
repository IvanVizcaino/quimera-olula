import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { Factura } from "../diseño.ts";
import { etiquetaEstadoFactura } from "../dominio.ts";

export const metaTablaFactura: MetaTabla<Factura> = [
  {
    id: "editable",
    cabecera: "Estado",
    render: (factura: Factura) => (
      <EtiquetaEstado {...etiquetaEstadoFactura(factura)} />
    ),
  },
  { id: "codigo", cabecera: "Código", prioridad: "alta", estilo: "secundario" },
  { id: "nombreProveedor", cabecera: "Proveedor", prioridad: "alta", estilo: "destacado" },
  { id: "fecha", cabecera: "Fecha", tipo: "fecha", prioridad: "alta" },
  {
    id: "total",
    estilo: "destacado",
    cabecera: "Total",
    tipo: "moneda",
    prioridad: "alta",
    divisa: (factura) => factura.divisaId,
  },
  { id: "numeroProveedor", cabecera: "Nº factura proveedor", prioridad: "media" },
  {
    id: "deAbono",
    cabecera: "Abono",
    prioridad: "media",
    render: (factura) => (factura.deAbono ? "Sí" : ""),
  },
  {
    id: "codigoRectificativa",
    cabecera: "Rectifica a",
    prioridad: "baja",
    render: (factura) => factura.codigoRectificativa ?? "",
  },
  { id: "idFiscal", cabecera: "Id Fiscal", prioridad: "baja" },
];
