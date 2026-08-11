import { PrioridadIncidencia } from "#/crm/comun/componentes/PrioridadIncidencia.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QAvatar, QIcono, QTarjetaGenerica } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  filtroTextos,
  getMetaFiltroDefecto,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearFechaDate } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { EstadoIncidenciaSanhigia } from "../../../../componentes/EstadoIncidenciaSanhigia.tsx";
import { TipoIncidenciaSanhigia } from "../../../../componentes/TipoIncidenciaSanhigia.tsx";
import { CrearIncidencia } from "../crear/CrearIncidencia.tsx";
import { DetalleIncidencia } from "../detalle/DetalleIncidencia.tsx";
import { Incidencia } from "../diseño.ts";
import { metaTablaIncidencia } from "./maestro.ts";
import "./MaestroIncidencias.css";
import { getMaquina } from "./maquina.ts";

const FILTRO_NO_CERRADAS: ClausulaFiltro = ["estado", "!", "Cerrada"];

const criteriaInicialIncidencias = {
  ...criteriaDefecto,
  filtro: [FILTRO_NO_CERRADAS],
};

export const MaestroIncidencias = () => {
  const { id, criteria } = getUrlParams();
  const criteriaBase =
    criteria.filtro.length > 0 ? criteria : criteriaInicialIncidencias;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    incidencias: listaActivaEntidadesInicial<Incidencia>(id, criteriaBase),
  });

  useUrlParams(ctx.incidencias.activo, ctx.incidencias.criteria);

  useEffect(() => {
    emitir("recarga_de_incidencias_solicitada", ctx.incidencias.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="MaestroIncidencias">
      <MaestroDetalle<Incidencia>
        Maestro={
          <>
            <h2>Incidencias</h2>

            <Listado<Incidencia>
              metaTabla={metaTablaIncidencia}
              metaFiltro={{
                ...getMetaFiltroDefecto(metaTablaIncidencia),
                estado: {
                  id: "estado",
                  label: "Estado",
                  filtro: (v) => {
                    const valor = (v as string) || "";
                    return valor
                      ? (["estado", "~", valor] as ClausulaFiltro)
                      : FILTRO_NO_CERRADAS;
                  },
                  fromFiltro: (filtro) => {
                    const clausula = filtro.find(([campo]) => campo === "estado");
                    if (!clausula) return "";
                    const [, operador, valor] = clausula;
                    return operador === "!" ? "" : (valor ?? "");
                  },
                  render: (valor, onChange) => (
                    <EstadoIncidenciaSanhigia
                      valor={(valor as string) ?? ""}
                      onChange={(opcion) => onChange(opcion?.valor ?? "")}
                    />
                  ),
                },
                prioridad: {
                  id: "prioridad",
                  label: "Prioridad",
                  filtro: (v) => filtroTextos("prioridad", v),
                  render: (valor, onChange) => (
                    <PrioridadIncidencia
                      valor={(valor as string) ?? ""}
                      onChange={(opcion) => onChange(opcion?.valor ?? "")}
                    />
                  ),
                },
                tipo_incidencia: {
                  id: "tipo_incidencia",
                  label: "Tipo",
                  filtro: (v) => filtroTextos("tipo_incidencia", v),
                  render: (valor, onChange) => (
                    <TipoIncidenciaSanhigia
                      valor={(valor as string) ?? ""}
                      onChange={(opcion) => onChange(opcion?.valor ?? "")}
                    />
                  ),
                },
              }}
              criteriaInicial={criteriaInicialIncidencias}
              criteria={ctx.incidencias.criteria}
              tarjeta={TarjetaCrmIncidencia}
              entidades={ctx.incidencias.lista}
              totalEntidades={ctx.incidencias.total}
              seleccionada={ctx.incidencias.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_incidencia_solicitada")}
                  >
                    Nueva
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("incidencia_seleccionada", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleIncidencia id={ctx.incidencias.activo} publicar={emitir} />
        }
        seleccionada={ctx.incidencias.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearIncidencia publicar={emitir} />}
    </div>
  );
};

const iconoEstadoAccion = (estado: string) => {
  const icono = {
    Pendiente: "reloj",
    Nueva: "estrella",
    "Pendiente de datos": "informacion",
    Asignada: "usuario",
    Rechazada: "cerrar",
    Cerrada: "check",
  };

  return icono[estado as keyof typeof icono];
};

const claseEstadoAccion = (estado: string) => {
  const clase = {
    Pendiente: "pendiente",
    Nueva: "nueva",
    "Pendiente de datos": "pendiente-de-datos",
    Asignada: "asignada",
    Rechazada: "rechazada",
    Cerrada: "cerrada",
  };

  return clase[estado as keyof typeof clase] ?? "";
};

const TarjetaCrmIncidencia = (incidencia: Incidencia) => {
  return (
    <QTarjetaGenerica
      avatar={
        <QAvatar className={claseEstadoAccion(incidencia.estado)}>
          <QIcono nombre={iconoEstadoAccion(incidencia.estado)} tamaño="sm" />
        </QAvatar>
      }
      arribaIzquierda={incidencia.descripcion}
      arribaDerecha={formatearFechaDate(incidencia.fecha)}
      abajoIzquierda={incidencia.nombreCausante}
      abajoDerecha={
        incidencia.tipoIncidencia === "Transportista"
          ? "Transporte"
          : "Producto"
      }
    />
  );
};
