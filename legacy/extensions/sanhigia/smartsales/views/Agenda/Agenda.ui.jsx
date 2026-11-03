import { Container } from "@quimera/comps";
import Quimera, { navigate, QArray, useStateValue, util } from "quimera";
import { useEffect, useState } from "react";

import { Calendar, FabButton, FilterFab, ListTareas, ListTratos, MainBox } from "../../comps";

const today = new Date().toISOString().substring(0, 10);
let tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow = tomorrow.toISOString().substring(0, 10);

const item = t => {
  if (!t?.idTarea && !t?.idTrato) {
    return [];
  }
  if (t?.idTarea) {
    return (
      <ListTareas
        key={`tarea${t.idTarea}`}
        tareas={{ idList: [t.idTarea], dict: { [t.idTarea]: t } }}
      />
    );
  }

  return <ListTratos key={`trato${t?.idTrato}`} tratos={{ list: [t] }} />;
};
const agente = util.getGlobalSetting("user_data")?.user?.agente?.toString();

const getList = ({ tareas, tratos, filter, showTratos, showTareas }) => {
  return tratos
    .concat(tareas)
    .filter(reg => reg.codAgente === util.getGlobalSetting("user_data")?.user?.agente?.toString())
    .filter(filter)
    .filter(reg => !reg.idTarea || showTareas)
    .filter(reg => reg.idTarea || showTratos)
    .sort((a, b) =>
      `${a.fecha} ${a.hora ?? ""}`.localeCompare(`${b.fecha} ${b.hora ?? ""}`),
    )
    .map(reg => item(reg));
};

// const getList = ({ tareas, tratos, filter, showTratos, showTareas }) => {
//   const tratosList = []
//   return tareas
//     ?.sort((a, b) => (showTratos ? a.idTrato - b.idTrato : a.fecha - b.fecha))
//     .filter(showTareas ? filter : () => 1 === 2)
//     .map((tarea) => {
//       if (tratosList.includes(tarea.idTrato) || !showTratos) return item(tarea)
//       tratosList.push(tarea.idTrato)
//       return [
//         item(tratos.find((trato) => trato.idTrato === tarea.idTrato)),
//         item(tarea),
//       ]
//     })
//     .flat()
//     .concat(
//       tratos
//         ?.sort((a, b) => a.fecha - b.fecha)
//         .filter(
//           (trato) =>
//             showTratos && filter(trato) && !tratosList.includes(trato.idTrato)
//         )
//         .map((trato) => item(trato))
//     )
// }

function Agenda() {
  const [showTratos, setShowTratos] = useState(true);
  const [showTareas, setShowTareas] = useState(true);
  const [{ tratos, tareas, diaSeleccionado, tareasDia, tratosDia }, dispatch] = useStateValue();
  const agente = util.getGlobalSetting("user_data")?.user?.agente?.toString();

  useEffect(() => dispatch({ type: "onInit" }), [dispatch]);

  const todayLists = getList({
    tareas,
    tratos,
    filter: t => t.fecha === today,
    showTratos,
    showTareas,
  });
  const tomorrowLists = getList({
    tareas,
    tratos,
    filter: t => t.fecha === tomorrow,
    showTratos,
    showTareas,
  });
  const nextLists = getList({
    tareas,
    tratos,
    filter: t => t.fecha > tomorrow,
    showTratos,
    showTareas,
  });
  const cargandoDia = tareasDia === null || tratosDia === null;
  const diaLists = cargandoDia
    ? []
    : getList({
      tareas: tareasDia,
      tratos: tratosDia,
      filter: t => t.fecha === diaSeleccionado,
      showTratos,
      showTareas,
    });
  // console.log(todayLists);
  return (
    <Quimera.Template id="Agenda">
      <Container maxWidth="xs">
        <FabButton icon="add" text="Trato" onClick={() => navigate("/ss/trato/nuevo")} />
        <FilterFab
          onTratoFilterClicked={flag => setShowTratos(flag)}
          onTareaFilterClicked={flag => setShowTareas(flag)}
        />
        <MainBox title="Calendario">
          <Calendar
            tareas={
              showTareas
                ? QArray.countBy(
                  tareas.filter(t => t.codAgente === agente),
                  "fecha",
                )
                : {}
            }
            tratos={
              showTratos
                ? QArray.countBy(
                  tratos.filter(t => t.codAgente === agente),
                  "fecha",
                )
                : {}
            }
            seleccionado={diaSeleccionado}
            onDayClick={fecha => dispatch({ type: "onDiaSeleccionado", payload: { fecha } })}
          />
        </MainBox>
        {diaSeleccionado && diaSeleccionado !== today && (
          <MainBox
            title={util.formatDate(diaSeleccionado)}
            before
            callbackCerrado={() => dispatch({ type: "onDiaSeleccionado", payload: { fecha: null } })}
          >
            {cargandoDia
              ? "Cargando..."
              : diaLists.length
                ? diaLists
                : "No hay tratos/tareas para este día"}
          </MainBox>
        )}
        <MainBox title="Hoy">
          {todayLists.length ? todayLists : "No hay tratos/tareas para hoy"}
        </MainBox>
        <MainBox title="Mañana">
          {tomorrowLists.length ? tomorrowLists : "No hay tratos/tareas para mañana"}
        </MainBox>
        <MainBox title="Próximamente">
          {nextLists.length ? nextLists : "No hay más tratos/tareas en los próximos 30 días"}
        </MainBox>
      </Container>
    </Quimera.Template>
  );
}

export default Agenda;
