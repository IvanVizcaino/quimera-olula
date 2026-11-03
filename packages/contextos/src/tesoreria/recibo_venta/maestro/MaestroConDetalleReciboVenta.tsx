import { filtroCliente } from "#/ventas/comun/filtros.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  filtroFechas,
  MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { DetalleReciboVenta } from "../detalle/DetalleReciboVenta.js";
import { ReciboVenta } from "../diseño.js";
import {
  ESTADOS_RECIBO_VENTA_DEFECTO,
  estadosDesdeFiltro,
  filtroEstadoReciboVenta,
  opcionesEstadoReciboVenta,
  puedenAgruparse,
} from "../dominio.js";
import { AgruparRecibosVenta } from "./AgruparRecibosVenta.js";
import { recibosSeleccionados } from "./maestro.js";
import "./MaestroConDetalleReciboVenta.css";
import { getMaquina } from "./maquina.js";
import { metaTablaReciboVenta } from "./metatabla_recibo_venta.js";
import { RemesarRecibos } from "./RemesarRecibos.js";

const metaFiltroReciboVenta: MetaFiltro = {
  codigo: {
    id: "codigo",
    label: "Código",
    filtro: (v) => (v ? ["codigo", "~", v as string] : null),
  },
  cliente_id: filtroCliente,
  nombre_cliente: {
    id: "nombre_cliente",
    label: "Nombre cliente",
    filtro: (v) => (v ? ["nombre_cliente", "~", v as string] : null),
  },
  id_fiscal: {
    id: "id_fiscal",
    label: "ID Fiscal",
    filtro: (v) => (v ? ["id_fiscal", "~", v as string] : null),
  },
  fecha_vencimiento: {
    id: "fecha_vencimiento",
    label: "F. Vencimiento",
    tipo: "intervalo_fechas",
    filtro: (v) => filtroFechas("fecha_vencimiento", v),
  },
  estado: {
    id: "estado",
    label: "Estado",
    tipo: "multiseleccion",
    opciones: opcionesEstadoReciboVenta,
    filtro: filtroEstadoReciboVenta,
    fromFiltro: estadosDesdeFiltro,
  },
};

const criteriaRecibosVivos = (): Criteria => ({
  ...criteriaDefecto,
  filtro: [
    ["estado", "in", ESTADOS_RECIBO_VENTA_DEFECTO as unknown as string],
  ] as ClausulaFiltro[],
  paginacion: { ...criteriaDefecto.paginacion },
});

export const MaestroConDetalleReciboVenta = () => {
  const criteriaBase = useMemo(criteriaRecibosVivos, []);

  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

  const navigate = useNavigate();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    recibos: listaActivaEntidadesInicial<ReciboVenta>(id, criteriaInicial),
    seleccionados: [],
    remesaCreada: null,
  });

  const { estado, recibos, seleccionados, remesaCreada } = ctx;

  const [multiseleccion, setMultiseleccion] = useState(false);

  const elegidos = recibosSeleccionados(seleccionados, recibos.lista);
  const agrupables = puedenAgruparse(elegidos);
  const bloqueoAgrupar = elegidos.length > 0 && !agrupables;

  useEffect(() => {
    if (remesaCreada) navigate(`/tesoreria/remesa?id=${remesaCreada}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remesaCreada]);

  useUrlParams(recibos.activo, recibos.criteria);

  useEffect(() => {
    emitir("recarga_de_recibos_solicitada", recibos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="ReciboVenta">
      <MaestroDetalle<ReciboVenta>
        Maestro={
          <>
            <h2>Recibos de cobro</h2>
            <Listado<ReciboVenta>
              metaTabla={metaTablaReciboVenta}
              metaFiltro={metaFiltroReciboVenta}
              criteria={recibos.criteria}
              modoInicial="tabla"
              tarjeta={TarjetaReciboVenta}
              entidades={recibos.lista}
              totalEntidades={recibos.total}
              seleccionada={recibos.activo}
              seleccionadas={seleccionados}
              onMultiSeleccion={(ids) => emitir("seleccionados_cambiados", ids)}
              modoMultiseleccion={multiseleccion}
              onModoMultiseleccionChanged={setMultiseleccion}
              renderAcciones={() =>
                multiseleccion && (
                  <div className="maestro-botones">
                    {bloqueoAgrupar && (
                      <QEtiqueta variante="advertencia">
                        Solo se agrupan recibos de un mismo cliente
                      </QEtiqueta>
                    )}
                    <QBoton
                      onClick={() => emitir("agrupado_solicitado")}
                      deshabilitado={!agrupables}
                    >
                      {`Agrupar (${elegidos.length})`}
                    </QBoton>
                    <QBoton
                      onClick={() => emitir("remesado_solicitado")}
                      deshabilitado={elegidos.length === 0}
                    >
                      {`Remesar (${elegidos.length})`}
                    </QBoton>
                  </div>
                )
              }
              onSeleccion={(payload) => emitir("recibo_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleReciboVenta id={recibos.activo} publicar={emitir} />}
        seleccionada={recibos.activo}
        modoDisposicion="maestro-50"
      />

      {estado === "AGRUPANDO" && (
        <AgruparRecibosVenta recibos={elegidos} publicar={emitir} />
      )}

      {estado === "REMESANDO" && (
        <RemesarRecibos recibos={elegidos} publicar={emitir} />
      )}
    </div>
  );
};

const TarjetaReciboVenta = (recibo: ReciboVenta) => {
  return (
    <div className="tarjeta-recibo-venta" key={recibo.id}>
      <div className="tarjeta-recibo-venta-codigo">{recibo.codigo}</div>
      <div className="tarjeta-recibo-venta-importe">
        {formatearMoneda(recibo.importe, "EUR")}
      </div>
      <div className={`tarjeta-recibo-venta-estado estado-${recibo.estado}`}>
        {recibo.estado}
      </div>
    </div>
  );
};
