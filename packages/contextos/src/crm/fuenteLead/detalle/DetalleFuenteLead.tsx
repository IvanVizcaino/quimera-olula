import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, QInput } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarFuenteLead } from "../borrar/BorrarFuenteLead.tsx";
import { fuenteLeadVacia, metaFuenteLead } from "./detalle.ts";
import "./DetalleFuenteLead.css";
import { getMaquina } from "./maquina.ts";

export const DetalleFuenteLead = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const params = useParams();

  const fuenteLeadId = id ?? params.id;
  const titulo = (fuente_lead: Entidad) => fuente_lead.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      fuente_lead: fuenteLeadVacia,
    },
    publicar
  );

  const fuente_lead = useModelo(metaFuenteLead, ctx.fuente_lead);
  const { modelo, modificado, uiProps, valido } = fuente_lead;

  useEffect(() => {
    if (fuenteLeadId) {
      emitir("fuente_lead_id_cambiado", fuenteLeadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuenteLeadId]);

  return (
    <Detalle
      id={fuenteLeadId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_fuente_lead_cancelada", null)}
    >
      {!!fuenteLeadId && (
        <div className="DetalleFuenteLead">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: "Marcar por defecto",
                onClick: () => emitir("marcar_fuente_lead_por_defecto"),
                deshabilitado: modelo.valorDefecto,
              },
              {
                texto: "Borrar",
                onClick: () => emitir("borrado_fuente_lead_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <quimera-formulario>
            <QInput label="Descripción" {...uiProps("descripcion")} />
          </quimera-formulario>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("fuente_lead_cambiada", modelo)}
                deshabilitado={!valido}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_fuente_lead_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarFuenteLead publicar={emitir} fuente_lead={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
