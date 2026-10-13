import { filtroFamilia } from "#/almacen/comun/filtros.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useEffect, useMemo } from "react";
import { CrearArticulo } from "../crear/CrearArticulo.tsx";
import { DetalleArticulo } from "../detalle/DetalleArticulo.tsx";
import { Articulo } from "../diseño.ts";
import { UsoArticulo } from "../UsoArticulo.tsx";
import { ContextoMaestroArticulo } from "./diseño.ts";
import { metaTablaConDisponible } from "./disponible.ts";
import { getMaquina } from "./maquina.ts";

export const metaTablaArticuloBase: MetaTabla<Articulo> = [
  { id: "id", cabecera: "Referencia" },
  { id: "descripcion", cabecera: "Descripción" },
  {
    id: "descripcion_familia",
    cabecera: "Familia",
    render: (a) => a.descripcionFamilia,
  },
  { id: "uso", cabecera: "Uso", render: UsoArticulo },
];

const filtroBooleano =
  (campo: string) =>
  (valor: unknown): ClausulaFiltro | null =>
    valor === undefined || valor === null || valor === ""
      ? null
      : [campo, "=", String(valor)];

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
  barcode: {
    id: "barcode",
    label: "Cód. barras",
    filtro: (v) => (v ? ["barcode", "~", v as string] : null),
  },
  se_vende: {
    id: "se_vende",
    label: "Se vende",
    tipo: "checkbox",
    filtro: filtroBooleano("se_vende"),
  },
  se_compra: {
    id: "se_compra",
    label: "Se compra",
    tipo: "checkbox",
    filtro: filtroBooleano("se_compra"),
  },
  sin_stock: {
    id: "sin_stock",
    label: "No controla stock",
    tipo: "checkbox",
    filtro: filtroBooleano("sin_stock"),
  },
};

const criteriaConStock = (): Criteria => ({
  ...criteriaDefecto,
  filtro: [["sin_stock", "=", "false"]] as ClausulaFiltro[],
  paginacion: { ...criteriaDefecto.paginacion },
});

export const MaestroConDetalleArticulo = () => {
  // Slot de factoría: una app puede cambiar columnas y su orden (p. ej. crema_cafe, CC-02).
  const metaTablaArticulo = metaTablaConDisponible(
    (FactoryObj.app.Almacen?.articulo_metaTabla as
      | MetaTabla<Articulo>
      | undefined) ?? metaTablaArticuloBase,
    pluginActivo("disponible_art")
  );
  const criteriaBase = useMemo(criteriaConStock, []);

  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    articulos: listaActivaEntidadesInicial<Articulo>(id, criteriaInicial),
  } as ContextoMaestroArticulo);

  useUrlParams(ctx.articulos.activo, ctx.articulos.criteria);

  useEffect(() => {
    emitir("recarga_de_articulos_solicitada", ctx.articulos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Articulo">
      <MaestroDetalle<Articulo>
        seleccionada={ctx.articulos.activo}
        Maestro={
          <>
            <h2>Artículos</h2>
            <Listado<Articulo>
              metaTabla={metaTablaArticulo}
              metaFiltro={metaFiltroArticulo}
              modo="tabla"
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
        modoDisposicion="maestro-50"
        Detalle={
          <DetalleArticulo
            key={ctx.articulos.activo}
            id={ctx.articulos.activo}
            publicar={emitir}
          />
        }
      />
      <CrearArticulo
        publicar={emitir}
        onCancelar={() => emitir("creacion_cancelada")}
        activo={ctx.estado === "CREANDO_ARTICULO"}
      />
    </div>
  );
};
