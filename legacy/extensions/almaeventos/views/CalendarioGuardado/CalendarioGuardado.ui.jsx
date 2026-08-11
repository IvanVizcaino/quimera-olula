// import { Grid, Button, Column, Field, Table, Dialog, DialogContent, IconButton, Icon, Typography } from '@quimera/comps'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Icon,
  IconButton,
  QBox,
  QTitleBox,
  Typography,
} from "@quimera/comps";
import { CircularProgress, List, Tooltip, isToday } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";
import { useEffect } from "react";

function CalendarioGuardado({ useStyles, hash }) {
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
      payload: { hash },
    });
  }, [dispatch, hash]);

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  // const schema = getSchemas().lineasInventario;

  return (
    <Quimera.Template id="CalendarioGuardado">
      <QBox width={1} titulo={`Calendario eventos`} className="CalendarioEventos" maxWidth>
        <Grid container alignItems="center" style={{ marginBottom: "10px" }}>
          <Grid container size={12} alignItems="center" justifyContent="center">
            <Box>
              <Typography color="primary" variant="h5">
                {modo === "mes" ? mesYAnyo : anyo}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {calendario && !dibujandoCalendario && (
          <Box>
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
    </Quimera.Template>
  );
}

export default CalendarioGuardado;
