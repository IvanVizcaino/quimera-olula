import {
  Box,
  Button,
  Column,
  Field,
  Grid,
  Icon,
  IconButton,
  Paper,
  Table,
  Typography,
} from "@quimera/comps";
import {
  Avatar,
  Backdrop,
  Button as ButtonMUI,
  CircularProgress,
  Divider,
  Hidden,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";

import { Facturacli } from "../../../comps";

function BuscarFactura({ useStyles, callbackCerrado }) {
  const [
    {
      idFactura,
      filtroBuscarFactura,
      cabeceraFactura,
      indicadorCargando,
      lineas,
      objetoFacturaRecibida,
      razonDevolucion,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  return (
    <Quimera.Template id="BuscarFactura">
      <Box width={1} py={0} px={0}>
        <Paper>
          <Box width={1} display="flex" style={{ borderBottom: "1px solid black" }}>
            <Box flexGrow={1} display="flex" justifyContent="center">
              {lineas.length === 0 ? (
                <Box display="flex" justifyContent="center">
                  <Typography variant="h5">Buscar Factura</Typography>
                </Box>
              ) : (
                <Grid container direction="column" justifyContent="center">
                  <Grid size={12}>
                    <Box my={1} align="center">
                      <Typography variant="h4">{`Devolución Factura  (${cabeceraFactura.codigo})`}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
            <Box>
              <IconButton id="cerrar" size="small" onClick={() => callbackCerrado()}>
                <Icon>close</Icon>
              </IconButton>
            </Box>
          </Box>
          {lineas.length === 0 && (
            <>
              <Box mt={2} width={1} display="flex" justifyContent="center">
                <Box width={width === "xs" ? 1 : 0.5}>
                  <Facturacli
                    id="idFactura"
                    label="Buscar"
                    fullWidth
                    filtro={filtroBuscarFactura}
                  />
                </Box>
              </Box>
              <Box pt={2} pb={2} width={1} display="flex" justifyContent="center">
                <Button
                  id="buscarFacturaObtenida"
                  text="Buscar"
                  // className={classes.botonSecundario}
                  size="large"
                  disabled={!idFactura}
                />
              </Box>
            </>
          )}
          {!util.isEmptyObject(objetoFacturaRecibida) && !!idFactura ? (
            <>
              <Divider />
              <Box px={3} mt={1}>
                <Grid container direction="row" flex={1} >
                  <Grid size={{ xs: 12, sm: 6, md: 6 }} >
                    <Box align="left">
                      <Typography variant="h5">{cabeceraFactura.nombre}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                    <Box align="center">
                      <Typography variant="h5">{`${cabeceraFactura.fecha}`}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3, md: 3 }} alignItems="right">
                    <Box align="right">
                      <Typography variant="h5">{`${util.euros(cabeceraFactura.total)}`}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Box px={3} mb={1}>
                <Field.Text
                  id="razonDevolucion"
                  label="Razón de devolución"
                  fullWidth
                  error={razonDevolucion === ""}
                  helperText={razonDevolucion === "" ? "Indique la razón de la devolución" : null}
                />
                {/* <Typography variant="subtitle1">{'Prueba razon devolución ' + razonDevolucion}</Typography> */}
              </Box>
              <Divider />
              <Hidden smDown>
                <Table id="tdbLineasDevolucion" idField="idlinea" px={2} mt={1} data={lineas}>
                  <Column.Text
                    id="codigo"
                    header="Referencia"
                    value={lineas => lineas.referencia}
                    width={150}
                  />
                  <Column.Text
                    id="nombre"
                    header="Descripción"
                    value={lineas => lineas.descripcion}
                    flexGrow={1}
                    width={200}
                  />
                  <Column.Currency
                    id="importe"
                    header="Importe"
                    width={80}
                    value={lineas => lineas.importe}
                  />
                  <Column.Decimal
                    id="cantidad"
                    header="Cantidad"
                    width={80}
                    value={lineas => lineas.cantidad}
                  />
                  <Column.Action
                    id={`cantidadDevolver${lineas.idlinea}`}
                    header="A devolver"
                    width={80}
                    value={lineas =>
                      lineas.esKit ? (
                        <Typography variant="caption"> {"Es kit"}</Typography>
                      ) : (
                        <TextField
                          value={lineas.cantidadDevolver}
                          onBlur={event =>
                            dispatch({
                              type: "onCantidadDevolverCambiada",
                              payload: {
                                blur: true,
                                idlinea: lineas.idlinea,
                                nuevaCantidadDevolver: event.target.value,
                              },
                            })
                          }
                          onChange={event =>
                            dispatch({
                              type: "onCantidadDevolverCambia",
                              payload: {
                                blur: false,
                                idlinea: lineas.idlinea,
                                nuevaCantidadDevolver: event.target.value,
                              },
                            })
                          }
                          onClick={event => event.target.select()}
                          inputProps={{
                            style: { textAlign: "right", width: "40px", marginRight: "8px" },
                          }}
                        />
                      )
                    }
                  />
                  <Column.Action
                    id="actualizarCantidadDevolver"
                    value={lineas => (
                      <IconButton
                        id="actualizarCantidadDevolver"
                        size="small"
                        disabled={lineas.esKit}
                        onClick={() =>
                          dispatch({
                            type: "onActualizarCantidadDevolverClicked",
                            payload: { idlinea: lineas.idlinea },
                          })
                        }
                      >
                        <Icon>get_app</Icon>
                      </IconButton>
                    )}
                  />
                </Table>
              </Hidden>
              <Hidden mdUp>
                <List>
                  {lineas.map(linea => (
                    <ListItem key={linea.referencia} divider={true} my={0} py={0}>
                      <ListItemAvatar>
                        <Avatar className={classes.red}>
                          {linea.descripcion.substring(0, 1).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography component="div" variant="body1">
                            <strong>{`${linea.referencia}`}</strong>
                            {` ${linea.descripcion}`}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography
                              component="span"
                              variant="body2"
                            >{`Cantidad: ${linea.cantidad}`}</Typography>
                            <Typography component="span" variant="body2">{`Importe: ${util.euros(
                              linea.importe,
                            )}`}</Typography>
                            {linea.esKit ? (
                              <Typography component="span" variant="body2">
                                {" "}
                                {"Es kit"}
                              </Typography>
                            ) : (
                              <Typography component="span" variant="body2">
                                <TextField
                                  label="Devuelto"
                                  value={linea.cantidadDevolver}
                                  style={{ width: "60px", marginRight: "16px", textAlign: "right" }}
                                  onBlur={event =>
                                    dispatch({
                                      type: "onCantidadDevolverCambiada",
                                      payload: {
                                        blur: true,
                                        idlinea: linea.idlinea,
                                        nuevaCantidadDevolver: event.target.value,
                                      },
                                    })
                                  }
                                  onChange={event =>
                                    dispatch({
                                      type: "onCantidadDevolverCambia",
                                      payload: {
                                        blur: false,
                                        idlinea: linea.idlinea,
                                        nuevaCantidadDevolver: event.target.value,
                                      },
                                    })
                                  }
                                  onClick={event => event.target.select()}
                                  inputProps={{ style: { textAlign: "end" } }}
                                />
                              </Typography>
                            )}
                          </Box>
                        }
                      ></ListItemText>
                      <ListItemSecondaryAction>
                        <IconButton
                          id="actualizarCantidadDevolver"
                          disabled={linea.esKit}
                          onClick={() =>
                            dispatch({
                              type: "onActualizarCantidadDevolverClicked",
                              payload: { idlinea: linea.idlinea },
                            })
                          }
                        >
                          <Icon>get_app</Icon>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Hidden>
              <Divider />
              <Box id="pieBotones" width={1} display="flex" mt={2}>
                <Box flexGrow={1} pl={2}>
                  <ButtonMUI
                    onClick={() => dispatch({ type: "onActualizarTodasCantidadesDevolverClicked" })}
                    variant="contained"
                    color="secondary"
                  >
                    Devolución total
                  </ButtonMUI>
                </Box>
                <Box pr={2}>
                  <ButtonMUI
                    text="Crear devolución"
                    disabled={!razonDevolucion || lineas.every(li => li.cantidadDevolver === 0)}
                    onClick={() =>
                      util.getSetting("appDispatch")({
                        type: "invocarConfirm",
                        payload: {
                          titulo:
                            "Se va a crear un pedido de devolución con las cantidades seleccionadas ¿Está seguro?",
                          cuerpo: "",
                          textoSi: "CONFIRMAR",
                          textoNo: "CANCELAR",
                          alConfirmar: () =>
                            dispatch({ type: "onCrearDevolucionClicked", payload: {} }),
                        },
                      })
                    }
                    variant="contained"
                    color="primary"
                  >
                    Crear devolución
                  </ButtonMUI>
                </Box>
              </Box>
              <Box display="flex" mt={2} />
            </>
          ) : null}
        </Paper>
      </Box>
      <Backdrop className={classes.backdrop} open={indicadorCargando}>
        <Box align="center">
          Generando devolución&nbsp;&nbsp;
          <br />
          <CircularProgress />
        </Box>
      </Backdrop>
    </Quimera.Template>
  );
}

export default BuscarFactura;
