import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearArticulo } from "../crear/CrearArticulo.tsx";
import { DetalleArticulo } from "../detalle/DetalleArticulo.tsx";
import { Articulo } from "../diseño.ts";
import { ContextoMaestroArticulo, metaTablaArticulo } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleArticulo = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    articulos: listaActivaEntidadesInicial<Articulo>(id, criteria),
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
