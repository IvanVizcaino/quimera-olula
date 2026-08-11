import { EstadoIncidencia } from "#/crm/comun/componentes/EstadoIncidencia.tsx";
import { PrioridadIncidencia } from "#/crm/comun/componentes/PrioridadIncidencia.tsx";
import { TipoIncidencia } from "#/crm/comun/componentes/TipoIncidencia.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QDate, QModal, QTextArea } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getIncidencia, postIncidencia } from "../infraestructura.ts";
import "./CrearIncidencia.css";
import { metaNuevaIncidencia, nuevaIncidenciaVacia } from "./crear.ts";

export const CrearIncidencia = ({ publicar }: { publicar: EmitirEvento }) => {
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaIncidencia,
    nuevaIncidenciaVacia
  );

  const crear_ = useCallback(async () => {
    const id = await postIncidencia(modelo);
    const incidencia = await getIncidencia(id);
    publicar("incidencia_creada", incidencia);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_incidencia_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Nueva Incidencia"
      onCerrar={cancelar}
    >
      <div className="CrearIncidencia">
        <quimera-formulario>
          <QInput label="Descripción" {...uiProps("descripcion")} />
          <QInput label="Nombre" {...uiProps("nombre")} />
          <QDate label="Fecha" {...uiProps("fecha")} />
          <PrioridadIncidencia {...uiProps("prioridad")} />
          <EstadoIncidencia {...uiProps("estado")} />
          <TipoIncidencia {...uiProps("tipo_incidencia")} />
          <QTextArea
            label="Descripción larga"
            rows={5}
            {...uiProps("descripcion_larga")}
          />
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
