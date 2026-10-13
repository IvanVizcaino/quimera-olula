import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { conColumnaImpreso } from "#/comun/marca_impresion.ts";
import { MetaTabla, QIcono } from "@olula/componentes/index.js";
import { Pedido, Recibido } from "../diseño.ts";

const estadosRecepcion: Record<Recibido, string> = {
  "Sí": "recibido",
  Parcial: "parcial",
  No: "pendiente",
};

const estadoRecepcion = (pedido: Pedido): string =>
  estadosRecepcion[pedido.recibido ?? "No"];

export const metaTablaPedido: MetaTabla<Pedido> = conColumnaImpreso([
  {
    id: "recibido",
    cabecera: "",
    render: (pedido: Pedido) => (
      <ColumnaEstadoTabla
        estados={{
          recibido: (
            <QIcono
              nombre="circulo_relleno"
              tamaño="sm"
              color="var(--color-deshabilitado-oscuro)"
            />
          ),
          parcial: (
            <QIcono
              nombre="circulo_relleno"
              tamaño="sm"
              color="var(--color-advertencia-oscuro)"
            />
          ),
          pendiente: (
            <QIcono
              nombre="circulo_relleno"
              tamaño="sm"
              color="var(--color-exito-oscuro)"
            />
          ),
        }}
        estadoActual={estadoRecepcion(pedido)}
      />
    ),
  },
  { id: "codigo", cabecera: "Código", prioridad: "alta" },
  { id: "nombreProveedor", cabecera: "Proveedor", prioridad: "alta" },
  { id: "fecha", cabecera: "Fecha", tipo: "fecha", prioridad: "alta" },
  {
    id: "total",
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
]);
