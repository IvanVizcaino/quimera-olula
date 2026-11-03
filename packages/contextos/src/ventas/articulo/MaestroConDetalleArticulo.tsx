import { filtroFamilia } from "#/almacen/comun/filtros.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearArticulo } from "./crear/CrearArticulo.tsx";
import { DetalleArticulo } from "./detalle/DetalleArticulo.tsx";
import { Articulo } from "./diseño.ts";
import { getMaquina } from "./maestro/maquina.ts";
import { TarjetaArticulo } from "./TarjetaArticulo.tsx";

const metaTablaArticulo: MetaTabla<Articulo> = [
  { id: "id", cabecera: "Referencia" },
  { id: "descripcion", cabecera: "Descripción" },
  {
    id: "descripcion_familia",
    cabecera: "Familia",
    render: (a) => a.descripcionFamilia,
  },
  { id: "barcode", cabecera: "Cód. barras", render: (a) => a.codbarras },
  { id: "precio", cabecera: "Precio", tipo: "moneda" },
];

export const MaestroConDetalleArticulo = () => {
  const criteriaBase = useMemo(criteriaArticulosVenta, []);

  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    articulos: listaActivaEntidadesInicial<Articulo>(id, criteriaInicial),
  });

  useUrlParams(ctx.articulos.activo, ctx.articulos.criteria);

  useEffect(() => {
    emitir("recarga_de_articulos_solicitada", ctx.articulos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="VentasArticulo">
      <MaestroDetalle<Articulo>
        Maestro={
          <>
            <h2>Artículos</h2>
            <Listado<Articulo>
              metaTabla={metaTablaArticulo}
              tarjeta={TarjetaArticulo}
              metaFiltro={metaFiltro}
              criteria={ctx.articulos.criteria}
              entidades={ctx.articulos.lista}
              totalEntidades={ctx.articulos.total}
              seleccionada={ctx.articulos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("creacion_solicitada")}>
                    Nuevo Artículo
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("articulo_seleccionado", payload)}
              onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
              onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
            />
          </>
        }
        Detalle={<DetalleArticulo id={ctx.articulos.activo} publicar={emitir} />}
        seleccionada={ctx.articulos.activo}
        modoDisposicion="maestro-50"
      />
      <CrearArticulo
        publicar={emitir}
        onCancelar={() => emitir("creacion_cancelada")}
        activo={ctx.estado === "CREANDO_ARTICULO"}
      />
    </div>
  );
};

const criteriaArticulosVenta = (): Criteria => ({
  ...criteriaDefecto,
  filtro: [
    ["se_vende", "=", "true"],
    ["sin_stock", "=", "false"],
  ] as ClausulaFiltro[],
  paginacion: { ...criteriaDefecto.paginacion },
});

const metaFiltro: MetaFiltro = {
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
  barcode: {
    id: "barcode",
    label: "Cód. barras",
    filtro: (v) => (v ? ["barcode", "~", v as string] : null),
  },
  se_vende: {
    id: "se_vende",
    label: "Solo vendibles",
    tipo: "checkbox",
    filtro: (v) => (v === "true" ? ["se_vende", "=", "true"] : null),
    fromFiltro: (filtro) =>
      filtro.some(
        ([campo, , valor]) => campo === "se_vende" && valor === "true"
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
