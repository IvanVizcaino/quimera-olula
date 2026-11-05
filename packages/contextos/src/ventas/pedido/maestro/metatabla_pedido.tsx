import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { Pedido } from "../diseño.ts";
import { etiquetaEstadoPedido } from "./maestro.ts";

export const getMetaTablaPedido = () => metaTablaPedido;

const metaTablaPedido: MetaTabla<Pedido> = [
  {
    id: "estado",
    cabecera: "Estado",
    render: (pedido: Pedido) => (
      <EtiquetaEstado {...etiquetaEstadoPedido(pedido)} />
    ),
  },
  {
    id: "codigo",
    estilo: "secundario",
    cabecera: "Código",
    prioridad: "alta",
  },
  {
    id: "nombre_cliente",
    estilo: "destacado",
    cabecera: "Cliente",
    prioridad: "alta",
    render: (p) => p.cliente.nombre_cliente,
  },
  {
    id: "fecha",
    cabecera: "Fecha",
    tipo: "fecha",
    prioridad: "alta",
  },
  {
    id: "total",
    estilo: "destacado",
    cabecera: "Total",
    tipo: "moneda",
    prioridad: "alta",
    divisa: (pedido) => pedido.divisa_id,
  },
  {
    id: "nombre_agente",
    cabecera: "Agente",
    prioridad: "baja",
  },
  {
    id: "almacen_id",
    cabecera: "Almacén",
    prioridad: "baja",
    render: (p) => p.nombre_almacen || p.almacen_id,
  },
  {
    id: "fecha_salida",
    cabecera: "Fecha salida",
    tipo: "fecha",
    prioridad: "baja",
  },
];
