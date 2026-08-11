import { Agente, Cliente, Serie } from "@quimera-extension/base-ventas";
import { Box, Button, Field, Grid, Icon, QBox } from "@quimera/comps";
import { Checkbox, FormControlLabel } from "@quimera/thirdparty";
import Quimera, { useStateValue } from "quimera";
import { ACL } from "quimera/lib";
import { useEffect } from "react";

import initialData from "./initial-data";

function InformePedidosSan({ useStyles }) {
  const [
    { clientes, clientesTotal, clientesNoRepetidos, referencia, fechaDesde, fechaHasta, filtro },
    dispatch,
  ] = useStateValue();
  // const _c = useStyles()
  const classes = useStyles();

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        dispatch,
      },
    });
  }, [dispatch]);

  const puedoLanzar = () => filtro.fechaDesde != null && filtro.fechaHasta != null;
  const opcionesServido = [
    { key: "Todos", value: "Todos" },
    { key: "Pendiente", value: "Pendiente" },
    { key: "Sí", value: "Sí" },
    { key: "No", value: "No" },
    { key: "Parcial", value: "Parcial" },
  ];

  return (
    <Quimera.Template id="InformePedidosSan">
      <QBox
        titulo={`Pedidos y líneas`}
        botonesCabecera={[{ icon: "close", id: "atras", text: "Atrás" }]}
      >
        <Grid container direction="column" spacing={1}>
          <Grid size={12}>
            <Box width={1} border={0}>
              <Agente
                id="filtro.codAgente"
                label="Agente"
                todoslosagentes={ACL.can("crm.informe.todos_los_agentes")}
                fullWidth
              />
            </Box>
          </Grid>

          <Grid size={12}>
            <Box width={1} border={0}>
              <Cliente
                id="filtro.codCliente"
                label="Cliente"
                todoslosagentes={ACL.can("crm.informe.todos_los_agentes")}
                fullWidth
              />
            </Box>
          </Grid>
          <Grid container spacing={1}>
            <Grid size={4}>
              <Field.Select
                id="filtro.intervaloFecha"
                label="Intervalo"
                options={initialData.intervalos}
                fullWidth
              />
            </Grid>
            <Grid size={4}>
              <Field.Date id="filtro.fechaDesde" label="Fecha desde" className={classes.field} />
            </Grid>
            <Grid size={4}>
              <Field.Date id="filtro.fechaHasta" label="Fecha hasta" className={classes.field} />
            </Grid>
          </Grid>

          <Grid container spacing={1}>
            <Grid size={6}>
              <Serie id="filtro.codSerie" label={`Serie ${filtro.codSerie || ""}`} fullWidth />
            </Grid>
            <Grid container size={6} alignItems="flex-end">
              <Field.Select
                id="filtro.servido"
                options={opcionesServido}
                label="Servidos"
                fullWidth
                noOptionsText="Servidos"
              />
            </Grid>
          </Grid>

          <Grid container size={12}>
            <Box display="flex" alignItems="flex-end" justifyContent="flex-start">
              <FormControlLabel
                control={
                  <Checkbox
                    id="filtro/solopdtes"
                    checked={filtro.solopdtes}
                    onClick={() => dispatch({ type: "onFiltroSolopdtesClicked" })}
                  />
                }
                label="Mostrar sólo líneas pendientes albaranar"
                disabled={false}
              />
            </Box>
            <Box display="flex" alignItems="flex-end" justifyContent="flex-start">
              <FormControlLabel
                control={
                  <Checkbox
                    id="filtro.solodisponibles"
                    checked={filtro.solodisponibles}
                    onClick={() => dispatch({ type: "onFiltroSolodisponiblesClicked" })}
                  />
                }
                label="Mostrar sólo líneas con disponibilidad en el Stock"
                disabled={false}
              />
            </Box>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="space-around" mt={1}>
          <Button
            id="lanzarInforme"
            text="Lanzar"
            color="primary"
            variant="contained"
            disabled={!puedoLanzar()}
            startIcon={<Icon>file_download</Icon>}
          />
        </Box>
      </QBox>
    </Quimera.Template>
  );
}

export default InformePedidosSan;
