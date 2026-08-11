import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { BorrarLead } from "../borrar/BorrarLead.tsx";
import { Acciones } from "./acciones/Acciones.tsx";
import { leadVacio, metaLead } from "./detalle.ts";
import "./DetalleLead.css";
import { getMaquina } from "./maquina.ts";
import { Oportunidades } from "./oportunidades/Oportunidades.tsx";
import { TabDatos } from "./tabs/TabDatos.tsx";
import { TabObservaciones } from "./tabs/TabObservaciones.tsx";

export const DetalleLead = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const titulo = (lead: Entidad) => lead.nombre as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      lead: leadVacio,
    },
    publicar
  );

  const lead = useModelo(metaLead, ctx.lead);
  const { modelo, modificado, valido } = lead;

  useEffect(() => {
    emitir("lead_id_cambiado", id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ctx.lead.id) return;

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_lead_cancelada", null)}
    >
      <div className="DetalleLead">
        <QuimeraAcciones
          vertical
          acciones={[
            {
              texto: "Borrar",
              onClick: () => emitir("borrado_lead_solicitado"),
              advertencia: true,
            },
          ]}
        />

        <Tabs>
          <Tab label="Datos">
            <TabDatos lead={lead} />
          </Tab>

          <Tab label="Observaciones">
            <TabObservaciones lead={lead} />
          </Tab>

          <Tab label="Oportunidades">
            <Oportunidades lead={lead} />
          </Tab>

          <Tab label="Acciones">
            <Acciones lead={lead} />
          </Tab>
        </Tabs>

        {modificado && (
          <div className="botones maestro-botones">
            <QBoton
              onClick={() => emitir("lead_cambiado", modelo)}
              deshabilitado={!valido}
            >
              Guardar
            </QBoton>
            <QBoton
              tipo="reset"
              variante="texto"
              onClick={() => emitir("edicion_lead_cancelada")}
            >
              Cancelar
            </QBoton>
          </div>
        )}

        {ctx.estado === "BORRANDO" && (
          <BorrarLead publicar={emitir} lead={modelo} />
        )}
      </div>
    </Detalle>
  );
};
