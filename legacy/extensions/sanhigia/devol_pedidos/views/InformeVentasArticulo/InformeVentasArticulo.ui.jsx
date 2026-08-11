import { Familia, Subfamilia } from "@quimera-extension/base-almacen";
import { Agente, Serie } from "@quimera-extension/base-ventas";
import { Box, Button, Field, Grid, Icon, QBox } from "@quimera/comps";
import Quimera, { useStateValue } from "quimera";
import { ACL } from "quimera/lib";
import { useEffect } from "react";

import initialData from "./initial-data";

function InformeVentasArticulo({ useStyles }) {
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

  const puedoBuscar = () => filtro.fechaDesde && filtro.fechaHasta;

  return (
    <Quimera.Template id="InformeVentasArticulo">
      <QBox
        titulo={`Ventas por artículo`}
        botonesCabecera={[{ icon: "close", id: "atras", text: "Atrás" }]}
      >
        <Grid container direction="column" spacing={1}>
          <Grid size={12}>
            <Agente
              id="filtro.idAgente"
              label="Agente"
              fullWidth
              todoslosagentes={ACL.can("crm.informe.todos_los_agentes")}
            />
          </Grid>
          <Grid size={12}>
            <Familia id="filtro.codFamilia" label="Familia" fullWidth />
          </Grid>
          <Grid size={12}>
            <Subfamilia
              id="filtro.codSubfamilia"
              codFamilia={filtro.codFamilia}
              label="Subfamilia"
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <Field.Select
              id="filtro.intervaloFecha"
              label="Intervalo"
              options={initialData.intervalos}
              fullWidth
            />
          </Grid>
          <Grid size={6}>
            <Serie id="filtro.codSerie" label={`Serie ${filtro.codSerie || ""}`} fullWidth />
          </Grid>
          <Grid container>
            <Grid size={6}>
              <Field.Date id="filtro.fechaDesde" label="Fecha desde" className={classes.field} />
            </Grid>
            <Grid size={6}>
              <Field.Date id="filtro.fechaHasta" label="Fecha hasta" className={classes.field} />
            </Grid>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="space-around" mt={1}>
          <Button
            id="lanzarInforme"
            text="Lanzar"
            color="primary"
            variant="contained"
            disabled={!puedoBuscar()}
            startIcon={<Icon>file_download</Icon>}
          />
        </Box>
      </QBox>
    </Quimera.Template>
  );
}

export default InformeVentasArticulo;
