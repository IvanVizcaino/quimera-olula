import { filtroFamilia } from "#/almacen/comun/filtros.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.ts";
import { useEffect, useMemo } from "react";
import { CrearArticulo } from "../crear/CrearArticulo.tsx";
import { DetalleArticulo } from "../detalle/DetalleArticulo.tsx";
import { Articulo } from "../diseño.ts";
import { getMaquina } from "./maquina.ts";
import { TarjetaArticulo } from "./TarjetaArticulo.tsx";

const metaTablaArticulo: MetaTabla<Articulo> = [
  { id: "id", cabecera: "Referencia" },
  { id: "descripcion", cabecera: "Descripción" },
  {
    id: "descripcion_familia",
    cabecera: "Familia",
    render: (a) => a.descripcionFamilia,
  },
];

const criteriaArticulosCompra = (): Criteria => ({
  ...criteriaDefecto,
  filtro: [
    ["se_compra", "=", "true"],
    ["sin_stock", "=", "false"],
  ] as ClausulaFiltro[],
  paginacion: { ...criteriaDefecto.paginacion },
});

const metaFiltroArticulo: MetaFiltro = {
  id: {
    id: "id",
    label: "Referencia",
    filtro: (v) => (v ? ["id", "~", v as string] : null),
  },
  descripcion: {
    id: "descripcion",
    label: "Descripción",
    filtro: (v) => (v ? ["descripcion", "~", v as string] : null),
  },
  familia_id: filtroFamilia,
  se_compra: {
    id: "se_compra",
    label: "Solo comprables",
    tipo: "checkbox",
    filtro: (v) => (v === "true" ? ["se_compra", "=", "true"] : null),
    fromFiltro: (filtro) =>
      filtro.some(
        ([campo, , valor]) => campo === "se_compra" && valor === "true"
      )
        ? "true"
        : "",
  },
  sin_stock: {
    id: "sin_stock",
    label: "Sin stock",
    tipo: "checkbox",
    filtro: (v) => (v === "true" ? ["sin_stock", "=", "false"] : null),
    fromFiltro: (filtro) =>
      filtro.some(
        ([campo, , valor]) => campo === "sin_stock" && valor === "false"
      )
        ? "true"
        : "",
  },
};

export const MaestroConDetalleArticulo = () => {
  const criteriaBase = useMemo(criteriaArticulosCompra, []);

  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    articulos: listaActivaEntidadesInicial<Articulo>(id, criteriaInicial),
  });

  const { articulos } = ctx;

  useUrlParams(articulos.activo, articulos.criteria);

  useEffect(() => {
    emitir("recarga_de_articulos_solicitada", articulos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ComprasArticulo">
      <MaestroDetalle<Articulo>
        Maestro={
          <>
            <h2>Artículos</h2>
            <Listado<Articulo>
              metaTabla={metaTablaArticulo}
              metaFiltro={metaFiltroArticulo}
              tarjeta={TarjetaArticulo}
              criteria={articulos.criteria}
              modoInicial="tabla"
              entidades={articulos.lista}
              totalEntidades={articulos.total}
              seleccionada={articulos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_articulo_solicitado")}>
                    Nuevo Artículo
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("articulo_seleccionado", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleArticulo id={articulos.activo} publicar={emitir} />}
        seleccionada={articulos.activo}
        modoDisposicion="maestro-50"
      />
      {ctx.estado === "CREANDO" && <CrearArticulo publicar={emitir} />}
    </div>
  );
};
