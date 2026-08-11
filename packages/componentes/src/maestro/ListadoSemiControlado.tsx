import { ClausulaFiltro, Criteria, Entidad } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useCallback, useEffect, useState } from "react";
import { QIcono } from "../atomos/qicono.tsx";
import { MetaTabla, obtenerCols } from "../atomos/qtablacontrolada.tsx";
import { QTablaControlada } from "../atomos/qtablacontrolada.tsx";
import { QTarjetas } from "../atomos/qtarjetas.tsx";
import { QTarjetaMetatabla } from "../moleculas/qtarjeta_metatabla.tsx";
import { SinDatos } from "../SinDatos/SinDatos.tsx";
import "./Listado.css";
import { filtrarEntidad } from "./maestroFiltros/filtro.ts";
import {
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

type Modo = "tabla" | "tarjetas";

type MaestroProps<T extends Entidad> = {
  metaTabla?: MetaTabla<T>;
  metaFiltro?: MetaFiltro;
  cargando?: boolean;
  tarjeta?: (entidad: T) => React.ReactNode;
  renderAcciones?: () => React.ReactNode;
  idReiniciarCriteria?: string;
  criteriaInicial: Criteria;
  entidades: T[];
  totalEntidades: number;
  seleccionada: T | null;
  onSeleccion: (seleccionada: T) => void;
  modo?: Modo;
  modoInicial?: Modo;
  modosDisponibles?: Modo[];
  onModoChanged?: (modo: Modo) => void;
  onCriteriaChanged: (criteria: Criteria) => void;
};

export const ListadoSemiControlado = <T extends Entidad>({
  metaTabla,
  metaFiltro,
  cargando = false,
  idReiniciarCriteria,
  criteriaInicial = criteriaDefecto,
  tarjeta,
  renderAcciones,
  entidades,
  totalEntidades,
  seleccionada,
  onSeleccion,
  modo,
  modoInicial,
  modosDisponibles,
  onModoChanged,
  onCriteriaChanged,
}: MaestroProps<T>) => {
  const [criteria, setCriteria] = useState<Criteria>(criteriaInicial);
  const [modoEstado, setModoEstado] = useState<Modo>(modo ?? modoInicial ?? "tabla");
  const modoInterno = modo ?? modoEstado;

  const puedeTabla = metaTabla !== undefined;
  const puedeTarjetas = true;

  const modosDisponiblesCalculados: Modo[] = modosDisponibles
    ? modosDisponibles.filter((m) => {
        if (m === "tabla") return puedeTabla;
        if (m === "tarjetas") return puedeTarjetas;
        return false;
      })
    : [...(puedeTabla ? (["tabla"] as Modo[]) : []), "tarjetas"];

  const modoEfectivo = modosDisponiblesCalculados.includes(modoInterno)
    ? modoInterno
    : (modosDisponiblesCalculados[0] ?? "tarjetas");

  const cambiarCriteria = useCallback(
    (c: Criteria) => {
      setCriteria(c);
      onCriteriaChanged(c);
    },
    [setCriteria, onCriteriaChanged]
  );

  const entidadesFiltradas = entidades.filter((entidad) =>
    filtrarEntidad(entidad, criteria.filtro as ClausulaFiltro[])
  );

  const tarjetaGenerica =
    metaTabla !== undefined
      ? (entidad: T) => (
          <QTarjetaMetatabla entidad={entidad} metaTabla={obtenerCols(metaTabla)} />
        )
      : undefined;

  const cambiarModo = (nuevoModo: Modo) => {
    if (modo === undefined) setModoEstado(nuevoModo);
    onModoChanged?.(nuevoModo);
  };

  const mostrarCambioModo =
    modosDisponiblesCalculados.length > 1 && modoEfectivo;
  const acciones = renderAcciones?.();
  const mostrarCabecera = metaFiltro || mostrarCambioModo || Boolean(acciones);

  const renderTabla = (datos: T[]) => {
    if (!metaTabla) return null;

    return (
      <QTablaControlada
        metaTabla={metaTabla}
        datos={datos}
        cargando={cargando}
        seleccionadaId={seleccionada?.id}
        onSeleccion={onSeleccion}
        orden={criteria.orden}
        onOrdenChanged={(orden) => {
          cambiarCriteria({
            ...criteria,
            orden,
            paginacion: { ...criteria.paginacion, pagina: 1 },
          });
        }}
        paginacion={criteria.paginacion}
        onPaginacionChanged={(paginacion) => {
          cambiarCriteria({
            ...criteria,
            paginacion,
          });
        }}
        totalEntidades={totalEntidades}
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
        seleccionadaId={seleccionada?.id}
        onSeleccion={onSeleccion}
        onPaginacion={(pagina, limite) => {
          cambiarCriteria({ ...criteria, paginacion: { pagina, limite } });
        }}
        totalEntidades={totalEntidades}
        criteria={criteria}
      />
    );
  };

  const renderEntidades = () => {
    if (!entidadesFiltradas.length && !cargando) return <SinDatos />;

    const datos = entidadesFiltradas.length
      ? entidadesFiltradas
      : datosCargando<T>();

    if (modoEfectivo === "tarjetas") {
      if (tarjeta) return renderTarjetas(datos, tarjeta);
      if (tarjetaGenerica) return renderTarjetas(datos, tarjetaGenerica);
    }

    if (modoEfectivo === "tabla" && metaTabla) {
      return renderTabla(datos);
    }

    return null;
  };

  useEffect(() => {
    if (idReiniciarCriteria) {
      setCriteria(criteriaInicial);
    }
  }, [idReiniciarCriteria, criteriaInicial, setCriteria]);

  return (
    <div className="Listado">
      {mostrarCabecera && (
        <div className="listado-cabecera">
          <div className="listado-cabecera-izquierda">
            {metaFiltro && (
              <MaestroFiltrosActivoControlado
                metaFiltro={metaFiltro}
                filtro={criteria.filtro as ClausulaFiltro[]}
                filtroInicial={criteriaInicial.filtro as ClausulaFiltro[]}
                onFiltroChanged={(filtro) => {
                  cambiarCriteria({
                    ...criteria,
                    filtro,
                  });
                }}
              />
            )}
          </div>

          <div className="listado-cabecera-derecha">
            {acciones}
            {mostrarCambioModo && (
              <div className="cambio-modo">
                <span
                  className="cambio-modo-icono"
                  onClick={() =>
                    cambiarModo(modoEfectivo === "tabla" ? "tarjetas" : "tabla")
                  }
                >
                  <QIcono
                    nombre={modoEfectivo === "tabla" ? "lista" : "tabla"}
                    tamaño="md"
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {renderEntidades()}
    </div>
  );
};
