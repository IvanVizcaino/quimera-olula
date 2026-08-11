import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { MetaTabla, QIcono } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearAlbaran } from "../crear/CrearAlbaran.tsx";
import { DetalleAlbaran } from "../detalle/DetalleAlbaran.tsx";
import { Albaran } from "../diseño.ts";
import { TarjetaDocumentoVenta } from "#/ventas/comun/componentes/TarjetaDocumentoVenta.tsx";
import { metaTablaAlbaran as metaTablaBase } from "../dominio.ts";
import "./MaestroConDetalleAlbaran.css";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleAlbaran = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    albaranes: listaActivaEntidadesInicial<Albaran>(id, criteria),
  });

  useUrlParams(ctx.albaranes.activo, ctx.albaranes.criteria);

  useEffect(() => {
    emitir("recarga_de_albaranes_solicitada", ctx.albaranes.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metaTablaAlbaran = [
    {
      id: "estado",
      cabecera: "",
      render: (albaran: Albaran) => (
        <ColumnaEstadoTabla
          estados={{
            facturado: (
              <QIcono
                nombre={"circulo_relleno"}
                tamaño="sm"
                color="var(--color-deshabilitado-oscuro)"
              />
            ),
            pendiente: (
              <QIcono
                nombre={"circulo_relleno"}
                tamaño="sm"
                color="var(--color-exito-oscuro)"
              />
            ),
          }}
          estadoActual={albaran.idfactura ? "facturado" : "pendiente"}
        />
      ),
    },
    ...metaTablaBase,
  ] as MetaTabla<Albaran>;

  return (
    <div className="Albaran">
      <MaestroDetalle<Albaran>
        Maestro={
          <>
            <h2>Albaranes</h2>
            <Listado<Albaran>
              metaTabla={metaTablaAlbaran}
              tarjeta={(albaran) => (
                <TarjetaDocumentoVenta
                  codigo={albaran.codigo}
                  nombreCliente={albaran.cliente.nombre_cliente}
                  fecha={albaran.fecha}
                  total={albaran.total}
                  estado={albaran.idfactura ? "cerrado" : "pendiente"}
                />
              )}
              criteria={ctx.albaranes.criteria}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_albaran_solicitado")}>
                    Nuevo Albarán
                  </QBoton>
                </div>
              )}              entidades={ctx.albaranes.lista}
              totalEntidades={ctx.albaranes.total}
              seleccionada={ctx.albaranes.activo}
              onSeleccion={(payload) => emitir("albaran_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleAlbaran id={ctx.albaranes.activo} publicar={emitir} />}
        seleccionada={ctx.albaranes.activo}
        // modoDisposicion="maestro-50"
      />

      <QModal
        nombre="modal"
        abierto={ctx.estado === "CREANDO_ALBARAN"}
        onCerrar={() => emitir("creacion_cancelada")}
        titulo="Nuevo Albarán"
      >
        <CrearAlbaran publicar={emitir} />
      </QModal>
    </div>
  );
};
