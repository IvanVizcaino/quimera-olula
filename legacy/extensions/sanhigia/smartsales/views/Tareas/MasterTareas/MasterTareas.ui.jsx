import { Box, Filter, FilterBox, QBox, QListItem } from "@quimera/comps";
import { Checkbox, FormControlLabel, InfiniteScroll, List } from "@quimera/thirdparty";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";

import { AgenteSmartsales, Contacto } from "../../../comps";

const iconTipoTarea = {
  "Llamada": {
    icon: "phone_enabled",
    color: "#FF9191",
  },
  "Email": {
    icon: "mail",
    color: "#99E2CE",
  },
  "Whatsapp": {
    // icon: 'whatsapp',
    content: <img src="/img/whatsapp-icon.svg" width="32px" height="32px" alt="Whatsapp Logo" />,
    color: "#46C756",
  },
  "Cita": {
    icon: "groups",
    color: "#76ccfd",
  },
  "-": {
    icon: "groups",
  },
};

function MasterTareas() {
  const [{ tareas, estadosTareas, externalFilter, showFilter }, dispatch] = useStateValue();

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const altura = `calc(100vh - ${200}px)`;

  const botonesCabecera = [{ icon: "arrow_back", id: "atras", text: "Atrás" }];
  const botones = [
    {
      icon: "filter_alt",
      id: "showFilter",
      text: "Mostrar filtro",
      badgeVisible: Object.keys(tareas.filter?.and ?? {}).length - externalFilter?.length,
      badgeContent: Object.keys(tareas.filter?.and ?? {}).length - externalFilter?.length,
    },
  ];
  // const estados = [
  //   { key: "true", value: "Completada" },
  //   { key: "false", value: "No completada" },
  // ];

  const filtroEstado = Object.values(estadosTareas)
    .filter(estado => estado.checked)
    .map(estado => estado.value);

  return (
    <Quimera.Template id="MasterTareas">
      <Box width={anchoDetalle}>
        <QBox titulo="Tareas" botones={botones} botonesCabecera={botonesCabecera}>
          <FilterBox
            id="tareas.filter"
            schema={getSchemas().tarea}
            open={showFilter}
            externalFilter={externalFilter}
            lastFilter={true}
          >
            <Filter.Schema id="titulo" />
            <Contacto id="codcontacto" label="Contacto" filterField={true} fullWidth async />
            <AgenteSmartsales id="codagente" label="Agente" filterField={true} fullWidth async />
            <Filter.Schema id="fecha" type="interval" />
            <Box display="flex" justifyContent="space-between">
              <Filter.Schema id="fecha" type="desde" />
              <Filter.Schema id="fecha" type="hasta" />
            </Box>
            <Filter.Schema id="tipo" />
            {/* <Filter.Schema id="completada" /> */}
            {/* <FIltroEstadosTarea
              id="completada"
              label="Estado"
              options={estados}
              filterField={true}
              fullWidth
            /> */}
          </FilterBox>
          <Box display="flex" justifyContent="space-around">
            {Object.values(estadosTareas).map(estado => (
              <FormControlLabel
                style={{ margin: "0px", padding: "0px" }}
                // labelPlacement="start"
                label={estado.nombre}
                control={
                  <Checkbox
                    color="secondary"
                    checked={estado.checked}
                    onClick={() =>
                      dispatch({
                        type: "onFiltroRapidoClicked",
                        payload: { key: estado.key, value: !estado.checked },
                      })
                    }
                  />
                }
              />
            ))}
          </Box>
          <Box id="scrollableBox" style={{ height: altura, overflow: "auto" }}>
            <InfiniteScroll
              dataLength={tareas.idList ? tareas?.idList?.length : 0}
              next={() => dispatch({ type: `onNextTareas` })}
              hasMore={tareas?.page?.next !== null}
              loader={<h4>Loading...</h4>}
              scrollableTarget="scrollableBox"
            >
              <List>
                {Object.values(tareas?.dict ?? {})
                  ?.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  ?.filter(tarea => tarea.idTarea !== "nuevo")
                  // ?.filter(tarea =>
                  //   filtroEstado.length > 0
                  //     ? filtroEstado.includes(tarea.completada.toString())
                  //     : true,
                  // )
                  ?.map(tarea => {
                    // let tarea = tareas?.dict?.[idTarea]
                    return (
                      <QListItem
                        key={tarea?.idTarea}
                        onClick={() =>
                          dispatch({
                            type: "onTareasClicked",
                            payload: { item: tarea },
                          })
                        }
                        selected={tarea?.idTarea === tareas.current}
                        avatar={{
                          ...(iconTipoTarea[tarea?.tipo ?? "-"] ?? iconTipoTarea["-"]),
                        }}
                        tl={`${tarea?.titulo ?? ""} || ${tarea?.tituloTrato ?? ""}`}
                        tr={`${util.formatDate(tarea?.fecha)} ${tarea?.hora}`}
                        br={tarea?.nombreAgente ?? ""}
                        bl={`${tarea?.completada ? "Completada" : "Pendiente"} (${tarea?.nombreContacto ?? ""
                          })`}
                      />
                    );
                  })}
              </List>
            </InfiniteScroll>
          </Box>
        </QBox>
      </Box>
    </Quimera.Template>
  );
}

export default MasterTareas;
