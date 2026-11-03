import { ListItemLineaPedido } from "@quimera-extension/base-area_clientes";
import { Box, Field, Grid, Icon, IconButton, QBox, Typography } from "@quimera/comps";
import {
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Tab,
  Tabs,
} from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";

function PedidosDetalle({ useStyles }) {
  const [{ indiceTab, lineas, albaranes, pedidos }, dispatch] = useStateValue();
  const classes = useStyles();

  const width = useWidth();

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const desktop = !mobile;

  return (
    <Quimera.Template id="Detalle">
      {pedidos.dict[pedidos.current] && (
        <Box width={anchoDetalle} mx={desktop ? 0.5 : 0}>
          <QBox
            titulo={
              pedidos.dict[pedidos.current].referencia
                ? `Ref. ${pedidos.dict[pedidos.current].referencia}`
                : `Pedido ${pedidos.dict[pedidos.current].codigo}`
            }
            botonesCabecera={mobile ? [{ id: "atras", icon: "arrow_back", disabled: false }] : []}
          >
            <Box px={1}>
              <Box width={1} border={0} borderColor="gray" height={"calc(100%)"}>
                <Tabs
                  value={indiceTab}
                  onChange={(event, newValue) =>
                    dispatch({ type: "onTabSelected", payload: { value: newValue } })
                  }
                  className={classes.tabs}
                >
                  <Tab label="Datos" />
                  <Tab label="Líneas" />
                  {pedidos.dict[pedidos.current].estado === "CARGADO" && <Tab label="Albarán" />}
                </Tabs>
                {indiceTab === 0 && (
                  <Box>
                    <Grid container spacing={1}>
                      <Grid size={12}>
                        <Field.Text
                          id={`pedidos.dict.${pedidos.current}.nombreCliente`}
                          fullWidth
                          label="Cliente"
                          disabled
                        />
                      </Grid>
                      <Grid size={6}>
                        <Field.Date
                          id={`pedidos.dict.${pedidos.current}.mx_fechaprevistainicial`}
                          fullWidth
                          label="Fecha Prev. Inicial"
                          disabled
                          datePickerProps={{ slotProps: { textField: { variant: "standard" } } }}
                        />
                      </Grid>
                      <Grid size={6}>
                        <Field.Date
                          id={`pedidos.dict.${pedidos.current}.fechasalidareal`}
                          fullWidth
                          label="Fecha Prevista"
                          disabled
                          datePickerProps={{ slotProps: { textField: { variant: "standard" } } }}
                        />
                      </Grid>
                      <Grid size={6}>
                        <Field.Currency
                          id={`pedidos.dict.${pedidos.current}.neto`}
                          fullWidth
                          multiline
                          label="Base"
                          disabled
                        />
                      </Grid>
                      <Grid size={6}>
                        <Field.Currency
                          id={`pedidos.dict.${pedidos.current}.totaliva`}
                          fullWidth
                          multiline
                          label="I.V.A."
                          disabled
                        />
                      </Grid>
                      <Grid size={6}>
                        <Field.Float
                          id={`pedidos.dict.${pedidos.current}.total`}
                          fullWidth
                          multiline
                          label="Total"
                          disabled
                        />
                      </Grid>
                      <Grid size={6}>
                        <Box
                          display="flex"
                          alignItems="flex-end"
                          justifyContent="flex-end"
                          height={1}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                id={`pedidos.dict.${pedidos.current}.reclamado`}
                                checked={pedidos.dict[pedidos.current].reclamado}
                              />
                            }
                            label="Reclamado"
                            disabled
                          />
                        </Box>
                        {/* <Box display='flex' alignItems='flex-end' justifyContent='flex-end' height={1} >
                        <Field.CheckBox id={`pedidos.dict.${pedidos.current}.reclamado`} checked={pedidos.dict[pedidos.current].reclamado} value={pedidos.dict[pedidos.current].reclamado} label='Reclamado' disabled/>
                      </Box> */}
                      </Grid>
                      <Grid size={12}>
                        <Box
                          display="flex"
                          alignItems="flex-end"
                          justifyContent="flex-end"
                          height={1}
                        >
                          <Button
                            disabled={
                              pedidos.dict[pedidos.current].estado === "CARGADO" ||
                              pedidos.dict[pedidos.current].reclamado ||
                              pedidos.dict[pedidos.current].mx_fechaprevistainicial >=
                              pedidos.dict[pedidos.current].fechasalidareal
                            }
                            id="reclamar"
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              dispatch({
                                type: "onReclamarClicked",
                                payload: {
                                  idpedido: pedidos.current,
                                  codigo: pedidos.dict[pedidos.current].codigo,
                                },
                              })
                            }
                          >
                            Reclamar
                          </Button>
                        </Box>
                      </Grid>
                      <Grid size={12}>
                        <Box
                          display="flex"
                          alignItems="flex-end"
                          justifyContent="flex-end"
                          height={1}
                          visibility={
                            pedidos.dict[pedidos.current].fechasalidareal === null &&
                              pedidos.dict[pedidos.current].estado !== "CARGADO" &&
                              pedidos.dict[pedidos.current].estado !== "TERMINADO"
                              ? "visible"
                              : "hidden"
                          }
                        >
                          <Typography className={classes.notaSinTela}>
                            NOTA: El pedido está pendiente de tela.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                {indiceTab === 1 && (
                  <List>
                    {lineas.idList?.map(idLinea => (
                      <ListItemLineaPedido
                        key={idLinea}
                        divider
                        model={lineas.dict[idLinea]}
                        funPrimaryRight={linea => ""}
                        hideSecondary
                      />
                    ))}
                  </List>
                )}
                {indiceTab === 2 && (
                  <List>
                    {albaranes?.map(a => (
                      <ListItem key={a.codigo}>
                        <ListItemText
                          primary={a.codigo}
                          secondary={
                            <Typography component="span" variant="body2" color="textPrimary">
                              {`Agencia: ${a.transporte} Fecha: ${util.formatDate(a.fecha)}`}
                            </Typography>
                          }
                        />
                        {
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="Descargar"
                              onClick={() =>
                                dispatch({
                                  type: "onDescargarAlbaranClicked",
                                  payload: { albaran: a },
                                })
                              }
                            >
                              <Icon>download</Icon>
                            </IconButton>
                          </ListItemSecondaryAction>
                        }
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          </QBox>
        </Box>
      )}
    </Quimera.Template>
  );
}

export default PedidosDetalle;
