import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { conColumnaImpreso } from "#/comun/marca_impresion.ts";
import { MetaTabla, QIcono } from "@olula/componentes/index.js";
import { Factura } from "../diseño.ts";

export const metaTablaFactura: MetaTabla<Factura> = conColumnaImpreso([
  {
    id: "editable",
    cabecera: "",
    render: (factura: Factura) => (
      <ColumnaEstadoTabla
        estados={{
          cerrada: (
            <QIcono
              nombre="circulo_relleno"
              tamaño="sm"
              color="var(--color-deshabilitado-oscuro)"
            />
          ),
          abierta: (
            <QIcono
              nombre="circulo_relleno"
              tamaño="sm"
              color="var(--color-exito-oscuro)"
            />
          ),
        }}
        estadoActual={factura.editable ? "abierta" : "cerrada"}
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
]);
