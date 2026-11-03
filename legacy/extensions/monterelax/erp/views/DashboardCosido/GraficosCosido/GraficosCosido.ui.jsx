import { Chart } from "@quimera/comps";
import { Grid } from "@quimera/thirdparty";
import Quimera, { useStateValue } from "quimera";

function GraficosCosido({ useStyles }) {
  const [{ datosGraficoPendientes, datosGraficoMedia, datosGraficoTotales }] = useStateValue();
  // const classes = useStyles()

  return (
    <Quimera.Template id="GraficosCosido">
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <Chart.Bar chartProps={datosGraficoPendientes} />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <Chart.Bar chartProps={datosGraficoMedia} />
        </Grid>
        <Grid size={12}>
          <Chart.Bar chartProps={datosGraficoTotales} />
        </Grid>
      </Grid>
    </Quimera.Template>
  );
}

export default GraficosCosido;
