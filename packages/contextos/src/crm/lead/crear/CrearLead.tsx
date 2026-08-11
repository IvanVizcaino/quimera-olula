import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getLead, postLead } from "../infraestructura.ts";
import "./CrearLead.css";
import { metaNuevoLead, nuevoLeadVacio } from "./crear.ts";

export const CrearLead = ({ publicar }: { publicar: EmitirEvento }) => {
  const { modelo, uiProps, valido } = useModelo(metaNuevoLead, nuevoLeadVacio);

  const crear_ = useCallback(async () => {
    const id = await postLead(modelo);
    const lead = await getLead(id);
    publicar("lead_creado", lead);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_lead_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Nuevo Lead"
      onCerrar={cancelar}
    >
      <div className="CrearLead">
        <quimera-formulario>
          <QInput label="Nombre" {...uiProps("nombre")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Crear
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
