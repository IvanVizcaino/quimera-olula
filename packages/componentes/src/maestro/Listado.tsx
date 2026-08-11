import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ClausulaFiltro, Criteria, Entidad } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { criteriaQueryUrl } from "@olula/lib/infraestructura.ts";
import { useState } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import { QKanban, type QKanbanColumna } from "../atomos/qkanban.tsx";
import { MetaTabla } from "../atomos/qtabla.tsx";
import { QTablaControlada } from "../atomos/qtablacontrolada.tsx";
import { QTarjetas } from "../atomos/qtarjetas.tsx";
import { QTarjetaMetatabla } from "../moleculas/qtarjeta_metatabla.tsx";
import { SinDatos } from "../SinDatos/SinDatos.tsx";
import "./Listado.css";
import {
  getMetaFiltroDefecto,
  MaestroFiltrosActivoControlado,
  MetaFiltro,
} from "./maestroFiltros/MaestroFiltrosActivoControlado.tsx";

const datosCargando = <T extends Entidad>() =>
  new Array(10).fill(null).map(
    (_, i) =>
      ({
        id: i.toString(),
        ...Object.fromEntries(
          new Array(10).fill(null).map((_, j) => [j, "U00A0"])
        ),
      }) as T
  );

type Modo = "tabla" | "tarjetas" | "kanban";

export type FormatoDescarga = { valor: string; etiqueta: string };

type ListadoProps<T extends Entidad> = {
  metaTabla?: MetaTabla<T>;
  metaFiltro?: MetaFiltro;
  cargando?: boolean;
  tarjeta?: (entidad: T) => React.ReactNode;
  tarjetaKanban?: (entidad: T) => React.ReactNode;
  columnasKanban?: QKanbanColumna[];
  campoEstadoKanban?: keyof T;
  onCambioEstadoKanban?: (id: string, nuevoEstado: string) => void;
  renderAcciones?: () => React.ReactNode;
  criteriaInicial?: Criteria;
  criteria?: Criteria;
  entidades: T[];
  totalEntidades: number;
  seleccionada?: string;
  onSeleccion: (seleccionada: string) => void;
  modo?: Modo;
  modoInicial?: Modo;
  modosDisponibles?: Modo[];
  mostrarCambioModo?: boolean;
  onModoChanged?: (modo: Modo) => void;
  onCriteriaChanged: (criteria: Criteria) => void;
  onSiguientePagina?: (criteria: Criteria) => void;
  modoMultiseleccion?: boolean;
  onModoMultiseleccionChanged?: (modo: boolean) => void;
  seleccionadas?: string[];
  onMultiSeleccion?: (seleccionadas: string[]) => void;
  urlDescarga?: string;
  formatosDescarga?: FormatoDescarga[];
};

export const Listado = <T extends Entidad>({
  metaTabla,
  metaFiltro,
  cargando = false,
  criteriaInicial = criteriaDefecto,
  criteria = criteriaDefecto,
  tarjeta,
  tarjetaKanban,
  columnasKanban,
  campoEstadoKanban,
  onCambioEstadoKanban,
  renderAcciones,
  entidades,
  totalEntidades,
  seleccionada,
  onSeleccion,
  modo,
  modoInicial,
  modosDisponibles,
  mostrarCambioModo,
  onModoChanged,
  onCriteriaChanged,
  onSiguientePagina,
  modoMultiseleccion,
  onModoMultiseleccionChanged,
  seleccionadas,
  onMultiSeleccion,
  urlDescarga,
  formatosDescarga,
}: ListadoProps<T>) => {
  const [modoEstado, setModoEstado] = useState<Modo>(modo ?? modoInicial ?? "tabla");
  const modoInterno = modo ?? modoEstado;

  const [multiseleccionEstado, setMultiseleccionEstado] = useState(false);
  const multiseleccionInterna = modoMultiseleccion ?? multiseleccionEstado;

  const [seleccionadasEstado, setSeleccionadasEstado] = useState<string[]>([]);
  const seleccionadasInternas = seleccionadas ?? seleccionadasEstado;

  const [formatoSeleccionado, setFormatoSeleccionado] = useState(
    formatosDescarga?.[0]?.valor ?? ""
  );
  const [descargando, setDescargando] = useState(false);

  const handleDescarga = async () => {
    if (!urlDescarga || !formatoSeleccionado) return;
    setDescargando(true);
    try {
      const qs = criteriaQueryUrl(criteria.filtro, criteria.orden);
      const url = qs
        ? `${urlDescarga}${qs}&formato=${formatoSeleccionado}`
        : `${urlDescarga}?formato=${formatoSeleccionado}`;
      const blob = await RestAPI.blob(url);
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `exportacion.${formatoSeleccionado}`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } finally {
      setDescargando(false);
    }
  };

  const toggleSeleccion = (id: string) => {
    const nuevas = seleccionadasInternas.includes(id)
      ? seleccionadasInternas.filter((s) => s !== id)
      : [...seleccionadasInternas, id];
    if (seleccionadas === undefined) setSeleccionadasEstado(nuevas);
    onMultiSeleccion?.(nuevas);
  };

  const toggleModoMultiseleccion = () => {
    const nuevoModo = !multiseleccionInterna;
    if (modoMultiseleccion === undefined) setMultiseleccionEstado(nuevoModo);
    onModoMultiseleccionChanged?.(nuevoModo);
    if (!nuevoModo) {
      if (seleccionadas === undefined) setSeleccionadasEstado([]);
      onMultiSeleccion?.([]);
    }
  };

  const puedeTabla = metaTabla !== undefined;
  const puedeTarjetas = true;
  const puedeKanban =
    columnasKanban !== undefined &&
    campoEstadoKanban !== undefined &&
    onCambioEstadoKanban !== undefined;

  const modosDisponiblesCalculados: Modo[] = modosDisponibles
    ? modosDisponibles.filter((modo) => {
        if (modo === "tabla") return puedeTabla;
        if (modo === "tarjetas") return puedeTarjetas;
        if (modo === "kanban") return puedeKanban;
        return false;
      })
    : [
        ...(puedeKanban ? (["kanban"] as Modo[]) : []),
        ...(puedeTarjetas ? (["tarjetas"] as Modo[]) : []),
        ...(puedeTabla ? (["tabla"] as Modo[]) : []),
      ];

  const modoEfectivo = modosDisponiblesCalculados.includes(modoInterno)
    ? modoInterno
    : (modosDisponiblesCalculados[0] ?? null);

  const cambiarModo = (nuevoModo: Modo) => {
    if (modo === undefined) setModoEstado(nuevoModo);
    onModoChanged?.(nuevoModo);
  };

  const siguienteModo = (): Modo | null => {
    if (!modoEfectivo || modosDisponiblesCalculados.length === 0) return null;

    const indice = modosDisponiblesCalculados.indexOf(modoEfectivo);
    return modosDisponiblesCalculados[
      (indice + 1) % modosDisponiblesCalculados.length
    ];
  };

  const mostrarCambioModoPorDefecto =
    modosDisponiblesCalculados.length > 1 && Boolean(modoEfectivo) && !modo;
  const mostrarCambioModoFinal =
    (mostrarCambioModo ?? mostrarCambioModoPorDefecto) &&
    modosDisponiblesCalculados.length > 1 &&
    Boolean(modoEfectivo);
  const acciones = renderAcciones?.();

  const renderTabla = (datos: T[]) => {
    if (!metaTabla) return null;

    return (
      <QTablaControlada
        metaTabla={metaTabla}
        datos={datos}
        cargando={cargando}
        seleccionadaId={seleccionada}
        onSeleccion={(e: T) => onSeleccion(e.id)}
        orden={criteria.orden}
        onOrdenChanged={(orden) => {
          onCriteriaChanged({
            ...criteria,
            orden,
            paginacion: { ...criteria.paginacion, pagina: 1 },
          });
        }}
        paginacion={criteria.paginacion}
        onPaginacionChanged={(paginacion) => {
          onCriteriaChanged({
            ...criteria,
            paginacion,
          });
        }}
        totalEntidades={totalEntidades}
        seleccionadasIds={
          multiseleccionInterna ? seleccionadasInternas : undefined
        }
        onMultiSeleccionToggle={
          multiseleccionInterna ? toggleSeleccion : undefined
        }
        onSetSeleccionadas={
          multiseleccionInterna
            ? (nuevas) => {
                if (seleccionadas === undefined) setSeleccionadasEstado(nuevas);
                onMultiSeleccion?.(nuevas);
              }
            : undefined
        }
      />
    );
  };

  const renderTarjetas = (
    datos: T[],
    tarjetaRender: (entidad: T) => React.ReactNode
  ) => {
    return (
      <QTarjetas
        tarjeta={tarjetaRender}
        datos={datos}
        cargando={cargando}
        seleccionadaId={seleccionada}
        onSeleccion={(e: T) => onSeleccion(e.id)}
        onPaginacion={(pagina, limite) => {
          onCriteriaChanged({ ...criteria, paginacion: { pagina, limite } });
        }}
        totalEntidades={totalEntidades}
        criteria={criteria}
        onSiguientePagina={onSiguientePagina}
        seleccionadasIds={
          multiseleccionInterna ? seleccionadasInternas : undefined
        }
        onMultiSeleccionToggle={
          multiseleccionInterna ? toggleSeleccion : undefined
        }
      />
    );
  };

  const renderKanban = (
    datos: T[],
    tarjetaRender: (entidad: T) => React.ReactNode
  ) => {
    if (!columnasKanban || !campoEstadoKanban || !onCambioEstadoKanban)
      return null;

    return (
      <QKanban
        entidades={datos}
        cargando={cargando}
        columnas={columnasKanban}
        campoEstado={campoEstadoKanban}
        tarjeta={tarjetaRender}
        metaTabla={metaTabla}
        seleccionadaId={seleccionada}
        onSeleccion={(e: T) => onSeleccion(e.id)}
        onCambioEstado={onCambioEstadoKanban}
      />
    );
  };

  const renderEntidades = () => {
    if (!entidades.length && !cargando) return <SinDatos />;

    const datos = entidades.length ? entidades : datosCargando<T>();
    const tarjetaGenerica = metaTabla
      ? (entidad: T) => (
          <QTarjetaMetatabla entidad={entidad} metaTabla={metaTabla} />
        )
      : undefined;

    if (modoEfectivo === "tarjetas") {
      if (tarjeta) return renderTarjetas(datos, tarjeta);
      if (tarjetaGenerica) return renderTarjetas(datos, tarjetaGenerica);
    }

    if (modoEfectivo === "tabla" && metaTabla) {
      return renderTabla(datos);
    }

    if (modoEfectivo === "kanban") {
      if (tarjetaKanban) return renderKanban(entidades, tarjetaKanban);
      if (tarjeta) return renderKanban(entidades, tarjeta);
      if (tarjetaGenerica) return renderKanban(entidades, tarjetaGenerica);
    }

    return null;
  };

  return (
    <div className="Listado">
      <div className="listado-cabecera">
        <div className="listado-cabecera-izquierda">
          <MaestroFiltrosActivoControlado
            metaFiltro={
              metaFiltro ?? getMetaFiltroDefecto(metaTabla as MetaTabla<T>)
            }
            filtro={criteria.filtro as ClausulaFiltro[]}
            filtroInicial={criteriaInicial.filtro as ClausulaFiltro[]}
            onFiltroChanged={(filtro) => {
              onCriteriaChanged({
                ...criteria,
                filtro,
                paginacion: { ...criteria.paginacion, pagina: 1 },
              });
            }}
          />
          {urlDescarga && formatosDescarga && formatosDescarga.length > 0 && (
            <div className="listado-descarga">
              {formatosDescarga.length > 1 && (
                <select
                  value={formatoSeleccionado}
                  onChange={(e) => setFormatoSeleccionado(e.target.value)}
                >
                  {formatosDescarga.map((f) => (
                    <option key={f.valor} value={f.valor}>
                      {f.etiqueta}
                    </option>
                  ))}
                </select>
              )}
              <QBoton
                tamaño="pequeño"
                deshabilitado={descargando}
                onClick={handleDescarga}
              >
                {descargando ? "Exportando…" : "Exportar"}
              </QBoton>
            </div>
          )}
        </div>

        <div className="listado-cabecera-derecha">
          {acciones}
          {onMultiSeleccion && (
            <div className="cambio-modo">
              <span
                className={`cambio-modo-icono${multiseleccionInterna ? " activo" : ""}`}
                onClick={toggleModoMultiseleccion}
              >
                <QIcono nombre="check" tamaño="md" />
              </span>
            </div>
          )}
          {mostrarCambioModoFinal && (
            <div className="cambio-modo">
              <span
                className="cambio-modo-icono"
                onClick={() => {
                  const nuevoModo = siguienteModo();
                  if (nuevoModo) cambiarModo(nuevoModo);
                }}
              >
                <QIcono
                  nombre={
                    siguienteModo() === "kanban"
                      ? "kanban"
                      : siguienteModo() === "tarjetas"
                        ? "lista"
                        : "tabla"
                  }
                  tamaño="md"
                />
              </span>
            </div>
          )}
        </div>
      </div>
      {renderEntidades()}
    </div>
  );
};
