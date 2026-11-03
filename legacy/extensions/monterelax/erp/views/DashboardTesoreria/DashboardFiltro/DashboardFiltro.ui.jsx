import { Box, Button, Field, Grid, Typography } from "@quimera/comps";
import { AppBar } from "@quimera/thirdparty";
import Quimera, { useStateValue, util } from "quimera";

import CuentaBanco from "../../../comps/CuentaBanco";
import FormasPago from "../../../comps/FormasPago";
import initialData from "./../initial-data";

function DashboardFiltro({ useStyles }) {
  const [{ bufferFiltro, recibosOrdenados }, dispatch] = useStateValue();
  const classes = useStyles();

  return (
    <Quimera.Template id="DashboardFiltro">
      <AppBar position="sticky" className={classes.appBar}>
        <Box px={1}>
          <Box>
            <Grid container spacing={1} direction="column" >
              <Grid size={6}>
                <Field.Select
                  id="bufferFiltro.intervaloFecha"
                  label="Fechas"
                  options={initialData.intervalos}
                  fullWidth
                  boxStyle={classes.select}
                />
              </Grid>
              <Grid size={3}>
                <Field.Date
                  id="bufferFiltro.fechaDesde"
                  label="Desde"
                  boxStyle={classes.fecha}
                  datePickerProps={{ slotProps: { textField: { variant: "standard" } } }}
                />
              </Grid>
              <Grid size={3}>
                <Field.Date
                  id="bufferFiltro.fechaHasta"
                  label="Hasta"
                  boxStyle={classes.fecha}
                  datePickerProps={{ slotProps: { textField: { variant: "standard" } } }}
                />
              </Grid>
              <Grid size={6}>
                <CuentaBanco id="bufferFiltro.cuenta" label="Cuenta" fullWidth async />
              </Grid>
              <Grid size={6}>
                <FormasPago id="bufferFiltro.formaPago" label="FORMA DE PAGO" fullWidth />
              </Grid>
              <Grid size={12}>
                <Box display="flex" alignItems="flex-end" justifyContent="flex-end" height={1}>
                  <Button
                    id="filtrar"
                    variant="contained"
                    color="primary"
                    onClick={() => dispatch({ type: "onFiltrarClicked", payload: {} })}
                  >
                    Filtrar
                  </Button>
                </Box>
              </Grid>
              {recibosOrdenados.length !== 0 && (
                <Grid size={12}>
                  <Box display="flex" alignItems="flex-end" justifyContent="flex-end" pt={1}>
                    <Typography>
                      <strong className={classes.negro}>
                        Saldo Inicial: &nbsp; {util.euros(bufferFiltro.saldoCuenta)}
                      </strong>
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </AppBar>
    </Quimera.Template>
  );
}

export default DashboardFiltro;
