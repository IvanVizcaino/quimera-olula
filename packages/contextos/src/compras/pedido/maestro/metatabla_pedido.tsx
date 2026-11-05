import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { Pedido } from "../diseño.ts";
import { etiquetaEstadoPedido } from "../dominio.ts";

export const metaTablaPedido: MetaTabla<Pedido> = [
  {
    id: "recibido",
    cabecera: "Estado",
    render: (pedido: Pedido) => (
      <EtiquetaEstado {...etiquetaEstadoPedido(pedido)} />
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
    divisa: (pedido) => pedido.divisaId,
  },
  { id: "numeroProveedor", cabecera: "Nº proveedor", prioridad: "media" },
  {
    id: "fechaEntrada",
    cabecera: "Fecha entrada",
    tipo: "fecha",
    prioridad: "baja",
  },
  {
    id: "almacenId",
    cabecera: "Almacén",
    prioridad: "baja",
    render: (pedido) => pedido.nombreAlmacen || pedido.almacenId || "",
  },
  { id: "idFiscal", cabecera: "Id Fiscal", prioridad: "baja" },
];
