import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { Albaran } from "../diseño.ts";
import { etiquetaEstadoAlbaran } from "../dominio.ts";

export const metaTablaAlbaran: MetaTabla<Albaran> = [
  {
    id: "facturaId",
    cabecera: "Estado",
    render: (albaran: Albaran) => (
      <EtiquetaEstado {...etiquetaEstadoAlbaran(albaran)} />
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
];
