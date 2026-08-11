import { MetaTabla } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useNavigate } from "react-router";
import { Tarea } from "../diseño.ts";

const metaTablaTareas: MetaTabla<Tarea> = [
  {
    id: "titulo",
    cabecera: "Título",
    render: (tarea: Tarea) => tarea.titulo,
  },
  {
    id: "fecha",
    cabecera: "Fecha",
    tipo: "fecha",
  },
  {
    id: "hora",
    cabecera: "Hora",
    tipo: "hora",
  },
  {
    id: "tipo",
    cabecera: "Tipo",
    render: (tarea: Tarea) => tarea.tipo,
  },
  {
    id: "completada",
    cabecera: "Completada",
    render: (tarea: Tarea) => (tarea.completada ? "Sí" : "No"),
  },
];

export const TabTareasLista = ({
  tareas,
  cargando,
}: {
  tareas: Tarea[];
  cargando: boolean;
}) => {
  const navigate = useNavigate();

  const handleSeleccion = (tarea: Tarea) => {
    navigate(`/ss/tarea/${tarea.id}`);
  };

  return (
    <ListadoSemiControlado
      metaTabla={metaTablaTareas}
      entidades={tareas}
      totalEntidades={tareas.length}
      cargando={cargando}
      seleccionada={null}
      onSeleccion={handleSeleccion}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      renderAcciones={() => null}
    />
  );
};
