import { QArticulo } from "@quimera-extension/base-almacen";
import {
  Box,
  Button,
  Column,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Field,
  Grid,
  Icon,
  IconButton,
  LinearProgress,
  ListInfiniteScroll,
  Table,
  Typography,
} from "@quimera/comps";
import { Avatar, isWidthUp, ListItem, ListItemAvatar, ListItemText } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";
import { useEffect, useRef } from "react";

function InformeClientesNuevos({ useStyles }) {
  const [
    {
      abrirMostrarEmails,
      cliNuevos,
      emailsSeleccionados,
      estadoVista,
      fechaDesde,
      listaEmails,
      ordenCliNuevos,
      pagina,
      refs,
      soloSeleccionados,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const desktop = isWidthUp("sm", width);
  const ultimaLongitudPaginada = useRef(-1);

  const onScrollTablaClientesNuevos = event => {
    if (soloSeleccionados || pagina.next === null) return;
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const cercaDelFinal = scrollHeight - scrollTop - clientHeight < 100;
    if (cercaDelFinal && ultimaLongitudPaginada.current !== cliNuevos.length) {
      ultimaLongitudPaginada.current = cliNuevos.length;
      dispatch({ type: "onMostrarSiguienteClicked" });
    }
  };

  useEffect(() => {
    dispatch({ type: "init" });
  }, [dispatch]);

  useEffect(() => {
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      payload: { nombre: `Clientes nuevos` },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch]);

  const puedoLanzar = () =>
    estadoVista === "limpio" &&
    !soloSeleccionados &&
    // Object.keys(refs)?.length > 0 &&
    fechaDesde != null;
  const clientesSeleccionados = () => Object.keys(emailsSeleccionados)?.length > 0;
  const tengoDatos = () =>
    cliNuevos.length > 0 || Object.keys(refs)?.length > 0 || fechaDesde != null;

  return (
    <Quimera.Template id="InformeClientesNuevos">
      <Container className={classes.container} disableGutters={width === "xs" || width === "sm"}>
        <Box my={1} mx={desktop ? "default" : 1}>
          <Grid container >
            <Grid size={{ xs: 12, md: 4 }}>
              <QArticulo
                id="refs/ref1"
                label={`Ref. 1${refs["ref1"] ? ` (${refs["ref1"]})` : ""}`}
                boxStyle={classes.referencia}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <QArticulo
                id="refs/ref2"
                label={`Ref. 2${refs["ref2"] ? ` (${refs["ref2"]})` : ""}`}
                boxStyle={classes.referencia}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <QArticulo
                id="refs/ref3"
                label={`Ref. 3${refs["ref3"] ? ` (${refs["ref3"]})` : ""}`}
                boxStyle={classes.referencia}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container align="center" justifyContent="space-between">
            <Grid container size={6} justifyContent="flex-start">
              <Field.Date
                id="fechaDesde"
                field="fechaDesde"
                label="Desde fecha"
                className={classes.field}
              />
            </Grid>
            <Grid container size={6} justifyContent="flex-end" alignContent="flex-end" style={{ gap: 8 }}>
              {cliNuevos.filter(cli => cli.seleccionada === true)?.length > 0 && (
                <Grid>
                  <Box display="flex" alignItems="center">
                    <IconButton id="marcarSoloSeleccionados" size="small">
                      {soloSeleccionados ? (
                        <Icon>check_box</Icon>
                      ) : (
                        <Icon>check_box_outline_blank</Icon>
                      )}
                    </IconButton>
                    <Typography variant="body2">Solo seleccionados</Typography>
                  </Box>
                </Grid>
              )}
              <Grid>
                <Button
                  id="obtenerEmails"
                  text="Obtener emails"
                  color="secondary"
                  variant="contained"
                  disabled={!clientesSeleccionados()}
                  startIcon={<Icon>email</Icon>}
                />
              </Grid>
              <Grid>
                <Button
                  id="limpiarDatos"
                  text="Limpiar"
                  color="secondary"
                  variant="contained"
                  disabled={!tengoDatos()}
                  startIcon={<Icon>cleaning_services_outlined</Icon>}
                />
              </Grid>
              <Grid>
                <Button
                  id="lanzarInforme"
                  text="Lanzar"
                  color="primary"
                  variant="contained"
                  disabled={!puedoLanzar()}
                  startIcon={<Icon>file_download</Icon>}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {estadoVista === "lanzando" && <LinearProgress />}
        {desktop ? (
          estadoVista === "lanzadoConResultados" && (
            <Box
              id="scrollableTablaClientesNuevos"
              style={{ height: `calc(100vh - 250px)`, overflow: "auto" }}
              onScroll={onScrollTablaClientesNuevos}
            >
              <Table
                id="tdbClientesNuevos"
                idField="codCliente"
                data={!soloSeleccionados ? cliNuevos : cliNuevos.filter(cli => cli.seleccionada)}
                clickMode="line"
                orderColumn={ordenCliNuevos}
                next={() => !soloSeleccionados && dispatch({ type: "onMostrarSiguienteClicked" })}
                hasMore={pagina.next !== null}
                loader={soloSeleccionados ? " " : null}
              >
                <Column.Action
                  id="marcarCliente"
                  value={linea => (
                    <IconButton
                      id="seleccionarCliente"
                      size="small"
                      tooltip={linea.seleccionada ? "Deseleccionar cliente" : "Seleccionar cliente"}
                      onClick={() =>
                        dispatch({ type: "onSeleccionarClienteClicked", payload: { data: linea } })
                      }
                    >
                      {linea.seleccionada ? (
                        <Icon>check_box</Icon>
                      ) : (
                        <Icon>check_box_outline_blank</Icon>
                      )}
                    </IconButton>
                  )}
                />
                <Column.Text
                  id="codCliente"
                  header="Código"
                  order="codcliente"
                  pl={2}
                  value={cliente => cliente.codCliente}
                  width={150}
                />
                <Column.Text
                  id="nombreCliente"
                  header="Nombre"
                  order="nombrecliente"
                  value={cliente => cliente.nombreCliente}
                  flexGrow={1}
                  width={300}
                />
                <Column.Text
                  id="direccion"
                  header="Dirección"
                  order="direccion,dirnum"
                  value={cliente => cliente.direccion}
                  flexGrow={1}
                  width={450}
                />
                <Column.Text
                  id="telefono"
                  header="Teléfono"
                  order="telefono"
                  value={cliente => cliente.telefono}
                  flexGrow={1}
                  width={120}
                />
                <Column.Text
                  id="email"
                  header="Email"
                  order="email"
                  value={cliente => cliente.email}
                  width={350}
                />
                <Column.Date
                  id="fecha"
                  header="Fecha"
                  order="fecha"
                  value={cliente => cliente.fecha}
                  width={140}
                />
              </Table>
            </Box>
          )
        ) : (
          <Box>
            <ListInfiniteScroll
              next={() => dispatch({ type: "onMostrarSiguienteClicked" })}
              hasMore={pagina.next !== null}
            >
              {cliNuevos.map(cliente => (
                <ListItem
                  key={cliente.codCliente}
                  divider={true}
                  onClick={() =>
                    dispatch({
                      type: "onTdbClientesInactivosRowClicked",
                      payload: { id: cliente.codCliente },
                    })
                  }
                >
                  <ListItemAvatar>
                    <Avatar>{cliente?.nombreCliente?.substring(0, 1).toUpperCase()}</Avatar>
                    <IconButton
                      id="seleccionarCliente"
                      size="small"
                      tooltip={
                        cliente.seleccionada ? "Deseleccionar cliente" : "Seleccionar cliente"
                      }
                      onClick={() =>
                        dispatch({
                          type: "onSeleccionarClienteClicked",
                          payload: { data: cliente },
                        })
                      }
                    >
                      {cliente.seleccionada ? (
                        <Icon>check_box</Icon>
                      ) : (
                        <Icon>check_box_outline_blank</Icon>
                      )}
                    </IconButton>
                  </ListItemAvatar>
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography component="div" variant="body1">
                        <strong>{`${cliente.codCliente}`}</strong>
                        {` ${cliente.nombreCliente}`}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography component="span" variant="body2">{`${util.formatDate(
                            cliente.fecha,
                          )}`}</Typography>
                          <Typography component="span" variant="body2">
                            {cliente.telefono}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="flex-end">
                          <Typography component="span" variant="body2">
                            {cliente.email}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  ></ListItemText>
                </ListItem>
              ))}
            </ListInfiniteScroll>
          </Box>
        )}
        {estadoVista === "lanzadoSinResultados" && (
          <Box mt={4} display="flex" justifyContent="center">
            <Typography component="span" variant="h6">
              No existen registros para este criterio de búsqueda
            </Typography>
          </Box>
        )}

        <Dialog
          open={abrirMostrarEmails}
          maxWidth="sm"
          fullWidth
          onClose={() => dispatch({ type: "onCerrarMostrarEmails", payload: {} })}
        >
          <DialogTitle>
            <Grid container direction="column" alignItems="center" justifyContent="center">
              <Box flexGrow={1}>
                <Typography variant="body1" align="center">
                  EMAILS SELECCIONADOS
                </Typography>
              </Box>
              <Box flexGrow={0}>
                <IconButton id="copiarAClipboard" size="small" alt="copiar">
                  <Icon title="Copiar emails">content_copy</Icon>
                </IconButton>
                {/* <IconButton id='cerrar' size="small" alt="Cerrar" onClick={() => dispatch({ type: 'onCerrarMostrarEmails', payload: {} })}>
                <Icon title="Cerrar">close</Icon>
              </IconButton> */}
              </Box>
            </Grid>
          </DialogTitle>
          <DialogContent dividers={true}>
            <Box className={classes.multiLineEllipsisDos}>
              <Typography>{listaEmails}</Typography>
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Quimera.Template>
  );
}

export default InformeClientesNuevos;
