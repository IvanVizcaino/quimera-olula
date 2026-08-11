import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarIncidencia } from "../borrar/BorrarIncidencia.tsx";
import { CrearPresupuesto } from "../crear_presupuesto/CrearPresupuesto.tsx";
import { incidenciaVacia, metaIncidencia } from "./detalle.ts";
import "./DetalleIncidencia.css";
import { getMaquina } from "./maquina.ts";
import { TabDocumentos } from "./tabs/documentos/tab_documentos/TabDocumentos.tsx";
import { TabNotas } from "./tabs/notas/tab_notas/TabNotas.tsx";
import { TabGeneral } from "./tabs/TabGeneral.tsx";
import { TabTareas } from "./tabs/tareas/tab_tareas/TabTareas.tsx";

export const DetalleIncidencia = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const params = useParams();

  const incidenciaId = id ?? params.id;
  const titulo = (incidencia: Entidad) => incidencia.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      incidencia: incidenciaVacia,
    },
    publicar
  );

  const incidencia = useModelo(metaIncidencia, ctx.incidencia);
  const { modelo, modificado, valido } = incidencia;

  useEffect(() => {
    if (incidenciaId) {
      emitir("incidencia_id_cambiado", incidenciaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  // console.log("mimensaje_incidencia", incidencia?.modelo);

  return (
    <Detalle
      id={incidenciaId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_incidencia_cancelada", null)}
    >
      {!!incidenciaId && (
        <div className="DetalleIncidencia">
          <div className="maestro-botones ">
            <QBoton onClick={() => emitir("borrado_incidencia_solicitado")}>
              Borrar
            </QBoton>
            {!incidencia?.modelo?.presupuestoId && (
              <QBoton onClick={() => emitir("crear_presupuesto_solicitado")}>
                Crear presupuesto
              </QBoton>
            )}
          </div>

          <Tabs>
            <Tab label="General">
              <TabGeneral incidencia={incidencia} />
            </Tab>

            <Tab label="Tareas">
              <TabTareas incidenciaId={incidenciaId} />
            </Tab>

            <Tab label="Notas">
              <TabNotas
                incidenciaId={incidenciaId}
                agenteId={modelo.agenteId}
              />
            </Tab>

            <Tab label="Documentos">
              <TabDocumentos incidenciaId={incidenciaId} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("incidencia_cambiada", modelo)}
                deshabilitado={!valido}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_incidencia_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarIncidencia publicar={emitir} incidencia={modelo} />
          )}

          {ctx.estado === "CREANDO_PRESUPUESTO" && (
            <CrearPresupuesto publicar={emitir} incidencia={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
