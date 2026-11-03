import { Backdrop, Box, CircularProgress, Paper } from "@quimera/comps";
import { Grid, Hidden } from "@quimera/thirdparty";
import Quimera, { useStateValue, util } from "quimera";
import { useEffect } from "react";

function DashboardCosido({ tipo, useStyles }) {
  const [{ cargandoDatos, mediaPiezas, totalPiezas }, dispatch] = useStateValue();
  const classes = useStyles();

  useEffect(() => {
    dispatch({ type: "onInit" });
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      payload: { nombre: "Dashboard Cosido" },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch]);

  return (
    <Quimera.Template id="DashboardCosido">
      <br />
      <Box mx={1}>
        <Backdrop open={cargandoDatos} style={{ zIndex: 999 }}>
          Cargando&nbsp;
          <CircularProgress color="inherit" />
        </Backdrop>
        <Quimera.SubView id="DashboardCosido/FiltroDashboardCosido" />
        <Hidden mdUp>
          <Quimera.SubView id="DashboardCosido/GraficosCosido" />
        </Hidden>
        <Hidden smDown>
          <Box my={1}>
            <Paper>
              <Box p={1}>
                <Quimera.SubView id="DashboardCosido/GraficosCosido" />
              </Box>
            </Paper>
          </Box>
        </Hidden>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <Box component="div" className={classes.mediaContainer}>
              <div className={classes.mediaContainerTitle}>Media UP Cosidas</div>
              <div className={classes.mediaContainerValue}> {mediaPiezas}</div>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <Box component="div" className={classes.mediaContainer}>
              <div className={classes.mediaContainerTitle}>Total UP Cosidas</div>
              <div className={classes.mediaContainerValue}> {totalPiezas}</div>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Quimera.Template>
  );
}

export default DashboardCosido;
