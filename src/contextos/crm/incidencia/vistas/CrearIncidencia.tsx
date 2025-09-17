import { useContext } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QDate } from "../../../../componentes/atomos/qdate.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { QTextArea } from "../../../../componentes/atomos/qtextarea.tsx";
import { Mostrar } from "../../../../componentes/moleculas/Mostrar.tsx";
import { Usuario } from "../../../comun/componentes/usuario.tsx";
import { ContextoError } from "../../../comun/contexto.ts";
import { EmitirEvento } from "../../../comun/diseño.ts";
import { HookModelo, useModelo } from "../../../comun/useModelo.ts";
import { EstadoIncidencia } from "../../comun/componentes/EstadoIncidencia.tsx";
import { PrioridadIncidencia } from "../../comun/componentes/PrioridadIncidencia.tsx";
import { NuevaIncidencia } from "../diseño.ts";
import { metaNuevaIncidencia, nuevaIncidenciaVacia } from "../dominio.ts";
import { getIncidencia, postIncidencia } from "../infraestructura.ts";
import "./CrearIncidencia.css";

export const CrearIncidencia = ({
  publicar = () => {},
  activo = false,
}: {
  publicar?: EmitirEvento;
  activo: boolean;
}) => {
  const incidencia = useModelo(metaNuevaIncidencia, {
    ...nuevaIncidenciaVacia,
  });

  const cancelar = () => {
    incidencia.init();
    publicar("creacion_cancelada");
  };

  return (
    <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
      <FormAltaIncidencia publicar={publicar} incidencia={incidencia} />
    </Mostrar>
  );
};

const FormAltaIncidencia = ({
  publicar = () => {},
  incidencia,
}: {
  publicar?: EmitirEvento;
  incidencia: HookModelo<NuevaIncidencia>;
}) => {
  const { intentar } = useContext(ContextoError);

  const crear = async () => {
    const modelo = {
      ...incidencia.modelo,
    };
    const id = await intentar(() => postIncidencia(modelo));
    const incidenciaCreada = await getIncidencia(id);
    publicar("incidencia_creada", incidenciaCreada);
    incidencia.init();
  };

  const cancelar = () => {
    publicar("creacion_cancelada");
    incidencia.init();
  };

  return (
    <div className="CrearIncidencia">
      <h2>Nueva Incidencia</h2>
      <quimera-formulario>
        <QInput label="Descripción" {...incidencia.uiProps("descripcion")} />
        <QInput label="Nombre" {...incidencia.uiProps("nombre")} />
        <QDate label="Fecha" {...incidencia.uiProps("fecha")} />
        <PrioridadIncidencia {...incidencia.uiProps("prioridad")} />
        <EstadoIncidencia {...incidencia.uiProps("estado")} />
        <Usuario
          {...incidencia.uiProps("responsable_id")}
          label="Responsable"
        />
        <QTextArea
          label="Descripción larga"
          rows={5}
          {...incidencia.uiProps("descripcion_larga")}
        />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!incidencia.valido}>
          Guardar
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};
