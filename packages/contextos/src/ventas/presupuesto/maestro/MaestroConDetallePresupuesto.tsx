import { ColumnaEstadoTabla } from "#/comun/componentes/ColumnaEstadoTabla.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla, QIcono } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearPresupuesto } from "../crear/CrearPresupuesto.tsx";
import { DetallePresupuesto } from "../detalle/DetallePresupuesto.tsx";
import {
  metaTablaPresupuesto as metaTablaBase,
  Presupuesto,
} from "./diseño.ts";
import "./MaestroConDetallePresupuesto.css";
import { TarjetaDocumentoVenta } from "#/ventas/comun/componentes/TarjetaDocumentoVenta.tsx";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetallePresupuesto = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    presupuestos: listaActivaEntidadesInicial<Presupuesto>(id, criteria),
  });

  useUrlParams(ctx.presupuestos.activo, ctx.presupuestos.criteria);

  useEffect(() => {
    emitir("recarga_de_presupuestos_solicitada", ctx.presupuestos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metaTablaPresupuesto = [
    {
      id: "estado",
      cabecera: "",
      render: (presupuesto: Presupuesto) => (
        <ColumnaEstadoTabla
          estados={{
            aprobado: (
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
          estadoActual={presupuesto.aprobado ? "aprobado" : "pendiente"}
        />
      ),
    },
    ...metaTablaBase,
  ] as MetaTabla<Presupuesto>;

  return (
    <div className="Presupuesto">
      <MaestroDetalle<Presupuesto>
        Maestro={
          <>
            <h2>Presupuestos</h2>
            <Listado<Presupuesto>
              metaTabla={metaTablaPresupuesto}
              tarjeta={(presupuesto) => (
                <TarjetaDocumentoVenta
                  codigo={presupuesto.codigo}
                  nombreCliente={presupuesto.cliente.nombre_cliente}
                  fecha={presupuesto.fecha}
                  total={presupuesto.total}
                  estado={presupuesto.aprobado ? "cerrado" : "pendiente"}
                />
              )}
              criteria={ctx.presupuestos.criteria}              entidades={ctx.presupuestos.lista}
              totalEntidades={ctx.presupuestos.total}
              seleccionada={ctx.presupuestos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("crear_presupuesto_solicitado")}
                  >
                    Nuevo Presupuesto
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("presupuesto_seleccionado", payload)
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
        Detalle={
          <DetallePresupuesto id={ctx.presupuestos.activo} publicar={emitir} />
        }
        seleccionada={ctx.presupuestos.activo}
      />

      {ctx.estado === "CREANDO_PRESUPUESTO" && (
        <CrearPresupuesto
          publicar={emitir}
          onCancelar={() => emitir("creacion_presupuesto_cancelada")}
        />
      )}
    </div>
  );
};
