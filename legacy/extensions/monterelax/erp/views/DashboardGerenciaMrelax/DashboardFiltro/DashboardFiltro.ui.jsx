import { Box, Field, Icon } from "@quimera/comps";
import Quimera, { PropValidation } from "quimera";

import initialData from "./../initial-data";

function DashboardFiltro({ useStyles }) {
  const classes = useStyles();

  return (
    <Quimera.Template id="DashboardFiltro">
      <Box className={classes.filtro}>
        <Icon className={classes.iconoCabecera}>filter_alt</Icon>
        <Field.Select
          id="bufferFiltro.intervaloFecha"
          label="Fechas"
          options={initialData.intervalos}
          fullWidth
          boxStyle={classes.select}
        />
        <Field.Date
          id="bufferFiltro.fechaDesde"
          label="Desde"
          boxStyle={classes.fecha}
          datePickerProps={{ slotProps: { textField: { variant: "standard" } } }}
        />
        <Field.Date
          id="bufferFiltro.fechaHasta"
          label="Hasta"
          boxStyle={classes.fecha}
          datePickerProps={{ slotProps: { textField: { variant: "standard" } } }}
        />
      </Box>
    </Quimera.Template>
  );
}

export default DashboardFiltro;
