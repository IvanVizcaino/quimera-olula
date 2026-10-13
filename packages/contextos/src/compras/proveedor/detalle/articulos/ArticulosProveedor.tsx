import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.ts";
import { ArticuloProveedor } from "../../../articulo_proveedor/diseño.ts";
import { decimalesPrecioCompra } from "../../../comun/dominio.ts";

const metaTablaArticulos = (): MetaTabla<ArticuloProveedor> => [

  {
    id: "por_defecto",
    cabecera: "",
    ancho: "2.5rem",
    render: (p) =>
      p.porDefecto ? (
        <QIcono
          nombre="estrella"
          tamaño="sm"
          color="var(--color-exito)"
          relleno="var(--color-exito)"
        />
      ) : (
        ""
      ),
  },
  { id: "articulo_id", cabecera: "Referencia", render: (p) => p.articuloId },
  { id: "articulo", cabecera: "Artículo", ancho: "20rem" },
  {
    id: "ref_proveedor",
    cabecera: "Ref. proveedor",
    render: (p) => p.refProveedor,
  },
  {
    id: "coste",
    cabecera: "Coste",
    tipo: "moneda",
    divisa: (p) => p.divisaId,
    decimales: decimalesPrecioCompra(),
  },
  { id: "dto", cabecera: "% Dto.", tipo: "numero" },
];

const metaFiltroArticulos: MetaFiltro = {
  articulo_id: {
    id: "articulo_id",
    label: "Referencia",
    filtro: (v) => (v ? ["articulo_id", "~", v as string] : null),
  },
  articulo: {
    id: "articulo",
    label: "Artículo",
    filtro: (v) => (v ? ["articulo", "~", v as string] : null),
  },
};

export const ArticulosProveedor = ({
  articulos,
  publicar,
}: {
  articulos: ListaActivaEntidades<ArticuloProveedor>;
  publicar: EmitirEvento;
}) => (
  <Listado<ArticuloProveedor>
    metaTabla={metaTablaArticulos()}
    metaFiltro={metaFiltroArticulos}
    criteria={articulos.criteria}
    modo="tabla"
    entidades={articulos.lista}
    totalEntidades={articulos.total}
    seleccionada={articulos.activo}
    onSeleccion={(payload) => publicar("articulo_proveedor_seleccionado", payload)}
    onCriteriaChanged={(payload) =>
      publicar("criteria_de_articulos_prov_cambiado", payload)
    }
    onSiguientePagina={(payload) =>
      publicar("siguiente_pagina_de_articulos_prov", payload)
    }
  />
);
