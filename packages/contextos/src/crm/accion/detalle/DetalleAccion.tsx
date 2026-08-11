import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarAccion } from "../borrar/BorrarAccion.tsx";
import { FinalizarAccion } from "../finalizar/FinalizarAccion.tsx";
import { accionVacia, metaAccion } from "./detalle.ts";
import "./DetalleAccion.css";
import { getMaquina } from "./maquina.ts";
import { TabDatos } from "./tabs/TabDatos.tsx";
import { TabObservaciones } from "./tabs/TabObservaciones.tsx";

export const DetalleAccion = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const params = useParams();

  const accionId = id ?? params.id;
  const titulo = (accion: Entidad) => accion.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      accion: accionVacia,
    },
    publicar
  );

  const accion = useModelo(metaAccion, ctx.accion);
  const { modelo, modificado, valido } = accion;

  useEffect(() => {
    if (accionId) {
      emitir("accion_id_cambiada", accionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accionId]);

  return (
    <Detalle
      id={accionId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_accion_cancelada", null)}
    >
      {!!accionId && (
        <div className="DetalleAccion">
          <div className="maestro-botones">
            {modelo.estado === "Hecha" ? (
              <span className="accion-finalizada">
                Finalizada
                {modelo.fecha_fin ? ` ${formatearFechaDate(modelo.fecha_fin)}` : ""}
              </span>
            ) : (
              <QBoton onClick={() => emitir("finalizacion_accion_solicitada")}>
                Finalizar
              </QBoton>
            )}
            <QuimeraAcciones
              vertical
              acciones={[
                {
                  texto: "Borrar",
                  onClick: () => emitir("borrado_accion_solicitado"),
                  advertencia: true,
                },
              ]}
            />
          </div>

          <Tabs>
            <Tab label="Datos">
              <TabDatos accion={accion} />
            </Tab>

            <Tab label="Observaciones">
              <TabObservaciones accion={accion} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("accion_cambiada", modelo)}
                deshabilitado={!valido}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_accion_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}

          {ctx.estado === "FINALIZANDO" && (
            <FinalizarAccion publicar={emitir} accion={modelo} />
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarAccion publicar={emitir} accion={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
