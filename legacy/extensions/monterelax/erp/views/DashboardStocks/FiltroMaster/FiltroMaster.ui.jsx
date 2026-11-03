import { QArticulo } from "@quimera-extension/base-almacen";
import { Box, Button, Field, Grid, Typography } from "@quimera/comps";
import { AppBar } from "@quimera/thirdparty";
import Quimera, { useStateValue } from "quimera";

import Modelo from "../../../comps/Modelo";
import initialData from "./../filtro-estados";

function FiltroMaster({ useStyles }) {
  const [, dispatch] = useStateValue();
  const classes = useStyles();

  return (
    <Quimera.Template id="FiltroMaster">
      <AppBar position="sticky" className={classes.appBar}>
        <Box px={1}>
          <Box>
            <Grid container spacing={1}>
              <Grid size={6}>
                <Field.Select
                  id="filtro.estado"
                  label="Estado"
                  disableClearable={true}
                  options={initialData.estados}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <Modelo id="filtro.modelo" label="Modelo" fullWidth async />
              </Grid>
              <Grid size={6}>
                <QArticulo id="filtro.reftela" label="Tela" fullWidth async />
              </Grid>
              <Grid size={6}>
                <Field.Int id="filtro.cantidad" label="Cantidad" fullWidth async />
              </Grid>
              <Grid size={12}>
                <Box display="flex" alignItems="flex-end" justifyContent="flex-end" height={1}>
                  <Box
                    className={classes.container}
                    display="flex"
                    width={1}
                    justifyContent="flex-start"
                  >
                    <Box className={classes.greenBox} />
                    <Box px={2}>
                      <Typography variant="body1">Terminado</Typography>
                    </Box>
                    <Box className={classes.yellowBox} />
                    <Box px={2}>
                      <Typography variant="body1">Cosido</Typography>
                    </Box>
                  </Box>
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
            </Grid>
          </Box>
        </Box>
      </AppBar>
    </Quimera.Template>
  );
}

export default FiltroMaster;
