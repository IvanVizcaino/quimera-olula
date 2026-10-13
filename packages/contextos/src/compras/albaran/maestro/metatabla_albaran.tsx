import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { conColumnaImpreso } from "#/comun/marca_impresion.ts";
import { MetaTabla, QIcono } from "@olula/componentes/index.js";
import { Albaran } from "../diseño.ts";
import { albaranFacturado } from "../dominio.ts";

export const metaTablaAlbaran: MetaTabla<Albaran> = conColumnaImpreso([
  {
    id: "facturaId",
    cabecera: "",
    render: (albaran: Albaran) => (
      <ColumnaEstadoTabla
        estados={{
          facturado: (
            <QIcono
              nombre="circulo_relleno"
              tamaño="sm"
              color="var(--color-deshabilitado-oscuro)"
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
        estadoActual={albaranFacturado(albaran) ? "facturado" : "pendiente"}
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
    divisa: (albaran) => albaran.divisaId,
  },
  { id: "numeroProveedor", cabecera: "Nº proveedor", prioridad: "media" },
  {
    id: "almacenId",
    cabecera: "Almacén",
    prioridad: "baja",
    render: (albaran) => albaran.nombreAlmacen || albaran.almacenId || "",
  },
  { id: "idFiscal", cabecera: "Id Fiscal", prioridad: "baja" },
]);
