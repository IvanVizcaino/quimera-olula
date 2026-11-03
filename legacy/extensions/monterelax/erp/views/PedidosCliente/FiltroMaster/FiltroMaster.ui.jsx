import { Cliente } from "@quimera-extension/base-ventas";
import { Box, Button, Field, Grid, Typography } from "@quimera/comps";
import { AppBar, FormControlLabel, Switch } from "@quimera/thirdparty";
import Quimera, { useStateValue } from "quimera";

import Pedidos from "../../../comps/Pedidos";
import initialData from "./../filtro-estados";

function FiltroMaster({ useStyles }) {
  const [{ filtro, filtroServidos, filtroReferencia }, dispatch] = useStateValue();
  const classes = useStyles();

  return (
    <Quimera.Template id="FiltroMaster">
      <AppBar position="sticky" className={classes.appBar}>
        <Box px={1}>
          <Box>
            <Grid container spacing={1}>
              {!filtroReferencia ? (
                <>
                  <Grid size={6}>
                    <FormControlLabel
                      style={{ width: "100%" }}
                      classes={{ label: classes.labelCheckBox }}
                      control={
                        <Switch
                          size="small"
                          checked={filtroReferencia}
                          onChange={() => dispatch({ type: "onSwitchReferenciaClicked" })}
                          color="secondary"
                        />
                      }
                      label={
                        <Typography variant="body2" style={{ color: "#000" }}>
                          Filtrar por referencia
                        </Typography>
                      }
                    />
                  </Grid>
                  <Grid size={6}>
                    <FormControlLabel
                      style={{ width: "100%" }}
                      classes={{ label: classes.labelCheckBox }}
                      control={
                        <Switch
                          size="small"
                          checked={filtroServidos}
                          onChange={() => dispatch({ type: "onSwitchServidosClicked" })}
                          color="secondary"
                        />
                      }
                      label={
                        <Typography variant="body2" style={{ color: "#000" }}>
                          Mostrar servidos
                        </Typography>
                      }
                    />
                  </Grid>
                </>
              ) : (
                <Grid size={12}>
                  <FormControlLabel
                    style={{ width: "100%" }}
                    classes={{ label: classes.labelCheckBox }}
                    control={
                      <Switch
                        size="small"
                        checked={filtroReferencia}
                        onChange={() => dispatch({ type: "onSwitchReferenciaClicked" })}
                        color="secondary"
                      />
                    }
                    label={
                      <Typography variant="body2" style={{ color: "#000" }}>
                        Filtrar por referencia
                      </Typography>
                    }
                  />
                </Grid>
              )}
              {!filtroReferencia ? (
                <>
                  <Grid size={6}>
                    <Field.Select
                      id="filtro.estado"
                      label="Estado"
                      options={initialData.estados}
                      fullWidth
                      disabled={!!filtro.pedido}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Cliente
                      id="filtro.cliente"
                      label="Cliente"
                      fullWidth
                      async
                      disabled={!!filtro.pedido}
                    />
                  </Grid>
                </>
              ) : (
                <Grid size={6}>
                  <Pedidos id="filtro.pedido" label="Referencia" fullWidth async />
                </Grid>
              )}
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
            </Grid>
          </Box>
        </Box>
      </AppBar>
    </Quimera.Template>
  );
}

export default FiltroMaster;
