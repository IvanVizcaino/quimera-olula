import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDateInterval } from "@olula/componentes/atomos/qdateinterval.tsx";
import { QFechaHora } from "@olula/componentes/atomos/qfechahora.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { CategoriaIncidencia } from "../../../componentes/CategoriaIncidencia.tsx";
import { EstadoIncidenciaSanhigia } from "../../../componentes/EstadoIncidenciaSanhigia.tsx";
import { PrioridadIncidenciaSanhigia } from "../../../componentes/PrioridadIncidenciaSanhigia.tsx";
import { SubCategoriaIncidencia } from "../../../componentes/SubCategoriaIncidencia.tsx";
import { TipoIncidenciaSanhigia } from "../../../componentes/TipoIncidenciaSanhigia.tsx";
import {
  extensionDesdeTipoMime,
  nombreFicheroInformeIncidencias,
  rangoFechaHoraDesdeAtajo,
} from "./dominio.ts";
import "./InformeIncidencias.css";
import { getInformeIncidencias } from "./infraestructura.ts";

export const InformeIncidencias = () => {
  const { intentar } = useContext(ContextoError);
  const [agenteId, setAgenteId] = useState("");
  const [agenteNombre, setAgenteNombre] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [tipoIncidencia, setTipoIncidencia] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [codigoCausante, setCodigoCausante] = useState("");
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [articuloId, setArticuloId] = useState("");
  const [articuloDescripcion, setArticuloDescripcion] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarCategoria = useCallback((categoria: string) => {
    setCategoriaId(categoria);
    setSubcategoriaId("");
  }, []);

  const cambiarPeriodo = useCallback((atajo: string) => {
    const rango = rangoFechaHoraDesdeAtajo(atajo);
    if (!rango) {
      setPeriodo("");
      return;
    }

    setPeriodo(atajo);
    setFechaDesde(rango.fechaDesde);
    setFechaHasta(rango.fechaHasta);
  }, []);

  const cambiarFechaDesde = useCallback((v: string) => {
    setFechaDesde(v);
    setPeriodo("");
  }, []);

  const cambiarFechaHasta = useCallback((v: string) => {
    setFechaHasta(v);
    setPeriodo("");
  }, []);

  const limpiar = useCallback(() => {
    setAgenteId("");
    setAgenteNombre("");
    setPeriodo("");
    setFechaDesde("");
    setFechaHasta("");
    setEstado("");
    setPrioridad("");
    setTipoIncidencia("");
    setCategoriaId("");
    setSubcategoriaId("");
    setClienteId("");
    setClienteNombre("");
    setCodigoCausante("");
    setProveedorNombre("");
    setArticuloId("");
    setArticuloDescripcion("");
  }, []);

  const lanzar = useCallback(async () => {
    if (cargando) return;

    setCargando(true);
    try {
      const blob = await intentar(() =>
        getInformeIncidencias({
          agenteId,
          fechaDesde,
          fechaHasta,
          estado,
          prioridad,
          tipoIncidencia,
          categoriaId,
          subcategoriaId,
          clienteId,
          codigoCausante,
          articuloId,
        })
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreFicheroInformeIncidencias(
        { agenteNombre, fechaDesde, fechaHasta },
        extensionDesdeTipoMime(blob.type)
      );
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setCargando(false);
    }
  }, [
    agenteId,
    agenteNombre,
    fechaDesde,
    fechaHasta,
    estado,
    prioridad,
    tipoIncidencia,
    categoriaId,
    subcategoriaId,
    clienteId,
    codigoCausante,
    articuloId,
    cargando,
    intentar,
  ]);

  return (
    <div className="InformeIncidencias" style={{ margin: "20px" }}>
      <h2>Informe de incidencias</h2>

      <quimera-formulario>
        <Agente
          valor={agenteId}
          onChange={(opcion) => {
            setAgenteId(opcion?.valor ?? "");
            setAgenteNombre(opcion?.descripcion ?? "");
          }}
          label="Agente asociado"
          deshabilitado={cargando}
        />
        <QDateInterval
          label="Periodo"
          nombre="periodo"
          valor={periodo}
          onChange={(v) => cambiarPeriodo(v)}
          deshabilitado={cargando}
        />
        <QFechaHora
          label="Fecha desde"
          nombre="fecha_desde"
          valor={fechaDesde}
          onChange={(v) => cambiarFechaDesde(v)}
          deshabilitado={cargando}
        />
        <QFechaHora
          label="Fecha hasta"
          nombre="fecha_hasta"
          valor={fechaHasta}
          onChange={(v) => cambiarFechaHasta(v)}
          deshabilitado={cargando}
        />
        <PrioridadIncidenciaSanhigia
          valor={prioridad}
          onChange={(opcion) => setPrioridad(opcion?.valor ?? "")}
          deshabilitado={cargando}
        />
        <EstadoIncidenciaSanhigia
          valor={estado}
          onChange={(opcion) => setEstado(opcion?.valor ?? "")}
          deshabilitado={cargando}
        />
        <TipoIncidenciaSanhigia
          valor={tipoIncidencia}
          onChange={(opcion) => setTipoIncidencia(opcion?.valor ?? "")}
          deshabilitado={cargando}
        />
        <CategoriaIncidencia
          valor={categoriaId}
          onChange={(opcion) => cambiarCategoria(opcion?.valor ?? "")}
          deshabilitado={cargando}
        />
        <SubCategoriaIncidencia
          valor={subcategoriaId}
          categoriaIncidencia={categoriaId}
          onChange={(opcion) => setSubcategoriaId(opcion?.valor ?? "")}
          deshabilitado={cargando}
        />
        <Proveedor
          label="Causante"
          valor={codigoCausante}
          descripcion={proveedorNombre}
          onChange={(opcion) => {
            setCodigoCausante(opcion?.valor ?? "");
            setProveedorNombre(opcion?.descripcion ?? "");
          }}
          deshabilitado={cargando}
        />
        <Cliente
          valor={clienteId}
          descripcion={clienteNombre}
          onChange={(opcion) => {
            setClienteId(opcion?.valor ?? "");
            setClienteNombre(opcion?.descripcion ?? "");
          }}
          deshabilitado={cargando}
        />
        <Articulo
          valor={articuloId}
          descripcion={articuloDescripcion}
          onChange={(opcion) => {
            setArticuloId(opcion?.valor ?? "");
            setArticuloDescripcion(opcion?.descripcion ?? "");
          }}
          deshabilitado={cargando}
        />
      </quimera-formulario>

      <div
        className="botones maestro-botones"
        aria-live="polite"
        aria-atomic="true"
      >
        <QBoton
          onClick={lanzar}
          deshabilitado={cargando}
          props={{ disabled: cargando, "aria-busy": cargando }}
        >
          {cargando ? "Generando..." : "Lanzar"}
        </QBoton>
        <QBoton onClick={limpiar} variante="texto" deshabilitado={cargando}>
          Limpiar
        </QBoton>
      </div>
    </div>
  );
};
