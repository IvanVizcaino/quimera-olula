// import { Grid, Button, Column, Field, Table, Dialog, DialogContent, IconButton, Icon, Typography } from '@quimera/comps'
import "./CalendarioEventos.style.scss";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Icon,
  IconButton,
  Popover,
  QBox,
  QTitleBox,
  Typography,
} from "@quimera/comps";
import { CircularProgress, List, isToday } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";
import { useEffect } from "react";

function CalendarioEventos({ useStyles }) {
  const [
    {
      anchorFiltro,
      anyo,
      calendario,
      datosDia,
      diasSemana,
      dibujandoCalendario,
      fechaSeleccionada,
      mesYAnyo,
      mesesAnyo,
      modalDatosDia,
      modalNuevoEvento,
      modalFiltroVisible,
      modo,
      numFiltros,
      eventos,
    },
    dispatch,
  ] = useStateValue();
  // const _c = useStyles()
  const classes = useStyles();
  useEffect(() => {
    dispatch({
      type: "onInit",
    });
  }, [dispatch]);

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  // const schema = getSchemas().lineasInventario;

  return (
    <Quimera.Template id="CalendarioEventos">
      <QBox
        width={1}
        titulo={`Calendario eventos`}
        maxWidth
        className="CalendarioEventos"
        botonesCabecera={[
          {
            icon: "filter_alt",
            id: "mostrarFiltro",
            text: "Mostrar filtro",
            props: {
              onClick: event =>
                dispatch({
                  type: "onMostrarFiltroClicked",
                  payload: { anchor: event.currentTarget },
                }),
            },
            badgeContent: numFiltros,
          },
          { icon: "add_circle", id: "addEvent", text: "Nuevo evento" },
          { icon: "content_copy", id: "downloadCalendar", text: "Generar enlace a calendario" },
        ]}
      >
        <Grid container alignItems="center" style={{ marginBottom: "10px" }}>
          <Grid container size={2} justifyContent="flex-start">
            <Button
              id="cambiarModo"
              text={`Modo ${modo === "mes" ? "año" : "mes"}`}
              variant="outlined"
              color="primary"
            />
          </Grid>
          <Grid container size={8} alignItems="center" justifyContent="center">
            <IconButton
              id="cambiarIntervaloSiguiente"
              onClick={() =>
                dispatch({
                  type: modo === "mes" ? "onCambiarMesClicked" : "onCambiarAnyoClicked",
                  payload: { tipo: "anterior" },
                })
              }
            >
              <Icon fontSize="large">navigate_before</Icon>
            </IconButton>
            <Box>
              <Typography color="primary" variant="h5">
                {modo === "mes" ? mesYAnyo : anyo}
              </Typography>
            </Box>
            <IconButton
              id="cambiarIntervaloSiguiente"
              onClick={() =>
                dispatch({
                  type: modo === "mes" ? "onCambiarMesClicked" : "onCambiarAnyoClicked",
                  payload: { tipo: "siguiente" },
                })
              }
            >
              <Icon fontSize="large">navigate_next</Icon>
            </IconButton>
          </Grid>
          <Grid container size={2} justifyContent="flex-end">
            <Button id="hoy" text={"Hoy"} variant="outlined" color="primary" />
          </Grid>
        </Grid>

        {calendario && !dibujandoCalendario && (
          <Box maxHeight={`calc(100vh - 230px)`} overflow="auto">
            {calendario.map((mes, indexMes) => (
              <Grid>
                {modo === "anyo" && (
                  <Box my={2} display={"flex"} justifyContent={"center"}>
                    {" "}
                    <Typography color="primary" variant="h4">
                      {mesesAnyo[indexMes]}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" alignItems="stretch" justifyContent="space-around">
                  <Box width="100%" style={{ borderRight: "1px solid lightgrey" }}>
                    <Grid container>
                      {diasSemana.map((nombreDia, index) => (
                        <Grid style={{ width: "14.2857%" }} key={`${nombreDia}-${index}`} justifyContent="center">
                          {
                            <Box
                              width={1}
                              display="flex"
                              justifyContent="center"
                              style={{
                                borderLeft: "1px solid lightgrey",
                                borderRight: index === 7 ? "1px solid lightgrey" : "",
                              }}
                            >{`${nombreDia.substr(0, 3).toUpperCase()}.`}</Box>
                          }
                        </Grid>
                      ))}
                    </Grid>
                    {mes.map((semana, indexSemana) => (
                      <Grid key={`${indexSemana}semana`} container>
                        {semana.map((dia, indexDia) =>
                          dia.ocultar ? null : (
                            <Grid className={
                              dia?.objetosDia?.length > 0 ? "cajaDiaConDatos" : "cajaDia"
                            } key={`${indexDia}-${dia.fecha}diasDeSemana`}>
                              <Box
                                minWidth={1}
                                display="flex"
                                flexDirection="column"
                                onClick={() =>
                                  dispatch({
                                    type: "onDiaClicked",
                                    payload: { datosDia: dia.objetosDia, fechaDia: dia.fecha },
                                  })
                                }
                              >
                                <Box
                                  display="flex"
                                  justifyContent="center"
                                  px={1}
                                  mb={dia?.objetosDia?.length > 0 ? "0px" : "6px"}
                                  className={"cajaNumDia"}
                                  style={{
                                    backgroundColor: isToday(new Date(dia.fecha))
                                      ? "#c0ffff "
                                      : "transparent",
                                    cursor: "default",
                                    opacity: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    style={{
                                      color: isToday(new Date(dia.fecha))
                                        ? "#1fb9b4"
                                        : dia.esEsteMes
                                          ? "black"
                                          : "lightgray",
                                    }}
                                  >
                                    {dia.fecha.substring(8, 10)}
                                  </Typography>
                                </Box>

                                <Box flexGrow={1}>
                                  <Box
                                    className={classes.columnContainer}
                                    style={{ minHeight: `calc((80vh - 255px)/5)` }}
                                  >
                                    {dia.estaCargando ? (
                                      <Grid container justifyContent="center" alignItems="center">
                                        <CircularProgress />
                                      </Grid>
                                    ) : (
                                      <Box>
                                        <Box className={"contenidoDia"}>
                                          {dia.objetosDia.length > 0 &&
                                            dia.objetosDia.map((evento, indexDia) => (
                                              <Box width={1}>
                                                {/* {mobile ? (
                                                  <Box className="lineaEvento" />
                                                ) : (
                                                  <Tooltip
                                                    title={evento.descripcion}
                                                    placement="bottom-start"
                                                  >
                                                    <Typography
                                                      variant="subtitle1"
                                                      wrap
                                                      align="center"
                                                      justifyContent="center"
                                                      style={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        // color: "white",
                                                      }}
                                                    >
                                                      {evento.descripcion}
                                                    </Typography>
                                                  </Tooltip>
                                                )} */}
                                                <Tooltip
                                                  title={evento.descripcion}
                                                  placement="bottom-start"
                                                >
                                                  <Typography
                                                    variant="subtitle1"
                                                    wrap
                                                    align="center"
                                                    justifyContent="center"
                                                    style={{
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                      display: "-webkit-box",
                                                      WebkitLineClamp: 2,
                                                      WebkitBoxOrient: "vertical",
                                                      // color: "white",
                                                    }}
                                                  >
                                                    {evento.descripcion}
                                                  </Typography>
                                                </Tooltip>
                                              </Box>
                                            ))}
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>
                          ),
                        )}
                      </Grid>
                    ))}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Box>
        )}
        {dibujandoCalendario && (
          <Grid container justifyContent="center" alignItems="center">
            <CircularProgress size={30} />
          </Grid>
        )}
      </QBox>

      <Dialog open={modalDatosDia} fullWidth classes={{ paper: "paper" }}>
        <DialogTitle id="form-dialog-title">
          <Box display={"flex"} justifyContent={"space-between"}>
            <Box className={"tituloModal"}>{util.formatDate(fechaSeleccionada)}</Box>
            <Box>
              <IconButton
                id="cerrar"
                size="small"
                onClick={() => dispatch({ type: "onCerrarDatosDia" })}
              >
                <Icon>close</Icon>
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <QTitleBox titulo={"Eventos programados"}>
            <List disablePadding dense>
              {datosDia?.map(datos => (
                <Box width={1}>
                  <Typography
                    variant="subtitle1"
                    wrap
                    align="center"
                    justifyContent="center"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      // color: "white",
                    }}
                  >
                    {datos.descripcion}
                  </Typography>
                </Box>
              ))}
            </List>
          </QTitleBox>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modalNuevoEvento}
        fullWidth
        classes={{ paper: mobile ? classes.paper100100 : classes.paper2040 }}
      >
        <DialogTitle id="form-dialog-title">
          <Box className={"tituloModal"}>Nuevo evento</Box>
        </DialogTitle>
        <DialogContent>
          <Quimera.View
            id="EventoNuevo"
            callbackCerrado={payload => dispatch({ type: "onCerrarCrearEvento", payload })}
            callbackGuardado={payload => dispatch({ type: "onEventoCreado", payload })}
          />
        </DialogContent>
      </Dialog>

      <Popover
        id="filtroEventos"
        open={Boolean(modalFiltroVisible)}
        anchorEl={anchorFiltro}
        onClose={() => dispatch({ type: "onCerrarFiltroClicked" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          style: { width: mobile ? "100%" : "25%" },
        }}
      >
        <Quimera.SubView id="CalendarioEventos/CalendarioEventosFiltro" />
      </Popover>
    </Quimera.Template>
  );
}

export default CalendarioEventos;
