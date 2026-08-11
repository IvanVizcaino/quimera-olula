import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useCallback, useEffect } from "react";
import { CrearMotivoDevolucion } from "../crear/CrearMotivoDevolucion.tsx";
import { DetalleMotivoDevolucion } from "../detalle/DetalleMotivoDevolucion.tsx";
import { MotivoDevolucion } from "../diseño.ts";
import { metaTablaMotivoDevolucion } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleMotivoDevolucion = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    motivosDevolucion: listaActivaEntidadesInicial<MotivoDevolucion>(
      id,
      criteria
    ),
  });

  useUrlParams(ctx.motivosDevolucion.activo, ctx.motivosDevolucion.criteria);

  useEffect(() => {
    emitir(
      "recarga_de_motivos_devolucion_solicitada",
      ctx.motivosDevolucion.criteria
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirCreacionNormal = useCallback(() => {
    emitir("creacion_motivo_devolucion_solicitada");
  }, [emitir]);

  const cambiarOtro = useCallback(() => {
    emitir("cambiar_otro_solicitado");
  }, [emitir]);

  return (
    <div className="MotivoDevolucion">
      <MaestroDetalle<MotivoDevolucion>
        Maestro={
          <>
            <h2>Motivos de devolución</h2>
            <Listado<MotivoDevolucion>
              metaTabla={metaTablaMotivoDevolucion}
              modo="tabla"
              criteria={ctx.motivosDevolucion.criteria}
              entidades={ctx.motivosDevolucion.lista}
              totalEntidades={ctx.motivosDevolucion.total}
              seleccionada={ctx.motivosDevolucion.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={abrirCreacionNormal}>
                    Nuevo motivo de devolución
                  </QBoton>
                  <QBoton
                    onClick={cambiarOtro}
                    deshabilitado={!ctx.motivosDevolucion.activo}
                  >
                    Cambiar Otro
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("motivo_devolucion_seleccionado", payload)
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
          <DetalleMotivoDevolucion
            id={ctx.motivosDevolucion.activo}
            publicar={emitir}
          />
        }
        seleccionada={ctx.motivosDevolucion.activo}
        modoDisposicion="maestro-50"
      />

      <CrearMotivoDevolucion
        publicar={emitir}
        onCancelar={() => emitir("creacion_motivo_devolucion_cancelada")}
        activo={ctx.estado === "CREANDO_MOTIVO_DEVOLUCION"}
      />
    </div>
  );
};
