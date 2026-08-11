import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getEstadoLead, postEstadoLead } from "../infraestructura.ts";
import "./CrearEstadoLead.css";
import { metaNuevoEstadoLead, nuevoEstadoLeadVacio } from "./crear.ts";

export const CrearEstadoLead = ({ publicar }: { publicar: EmitirEvento }) => {
  const { modelo, uiProps, valido } = useModelo(
    metaNuevoEstadoLead,
    nuevoEstadoLeadVacio
  );

  const crear_ = useCallback(async () => {
    const id = await postEstadoLead(modelo);
    const estado_lead = await getEstadoLead(id);
    publicar("estado_lead_creado", estado_lead);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_estado_lead_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Nuevo Estado de Lead"
      onCerrar={cancelar}
    >
      <div className="CrearEstadoLead">
        <quimera-formulario>
          <QInput label="Código" maxLength={10} {...uiProps("id")} />
          <QInput label="Descripción" {...uiProps("descripcion")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Guardar
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
