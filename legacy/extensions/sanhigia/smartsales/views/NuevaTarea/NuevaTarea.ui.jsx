import { Box, Container, Field } from "@quimera/comps";
import Quimera, { getSchemas, useStateValue } from "quimera";
import { useEffect } from "react";

import { ConfirmButton, MainBox, TipoTarea } from "../../comps";

function NuevaTarea({ idTrato, codIncidencia, tipoTarea }) {
  const [{ tarea }, dispatch] = useStateValue();
  const schemaTarea = getSchemas().nuevaTarea;

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        idTrato,
        codIncidencia,
        tipoTarea,
      },
    });
  }, [idTrato, codIncidencia]);
  const tipoUpper = tipoTarea ? tipoTarea.charAt(0).toUpperCase() + tipoTarea.slice(1) : "Llamada";
  const puedoConfirmar = !schemaTarea.isValid(tarea);
  console.log("____________", tipoUpper);

  return (
    <Quimera.Template id="NuevaTarea">
      <Container maxWidth="xs">
        <MainBox title="Crear tarea" before={true}>
          <Field.Schema id="tarea.titulo" schema={schemaTarea} fullWidth />
        </MainBox>
        <MainBox>
          {tipoTarea && (
            <TipoTarea id="tarea.tipo" label="Tipo" fullWidth async value={tipoUpper} />
          )}
          {!tipoTarea && <TipoTarea id="tarea.tipo" label="Tipo" fullWidth async />}
        </MainBox>
        <MainBox>
          <Box display="flex" style={{ gap: "1em" }}>
            <Field.Schema id="tarea.fecha" schema={schemaTarea} fullWidth />
            <Field.Schema id="tarea.hora" schema={schemaTarea} fullWidth />
          </Box>
        </MainBox>
        {/* <MainBox>
          <Field.Schema
            id="tarea.idTrato"
            schema={schemaTarea}
            fullWidth
            disabled={!!idTrato}
          />
        </MainBox> */}
        {!tipoTarea && <ConfirmButton id="saveTarea" disabled={puedoConfirmar} />}

        {tipoTarea && (
          <Box display="flex" justifyContent={"space-between"}>
            <ConfirmButton
              id="saveTareaNow"
              text="Hacer ahora"
              style={{ fontSize: "0.9rem" }}
              disabled={puedoConfirmar}
            />
            <ConfirmButton
              id="saveTarea"
              text="Crear para más tarde"
              style={{ fontSize: "0.9rem" }}
              disabled={puedoConfirmar}
            />
          </Box>
        )}
      </Container>
    </Quimera.Template>
  );
}

export default NuevaTarea;
