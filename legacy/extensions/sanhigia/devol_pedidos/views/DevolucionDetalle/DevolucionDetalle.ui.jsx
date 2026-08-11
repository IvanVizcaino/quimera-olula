import {
  Box,
  Button,
  Column,
  Container,
  Field,
  Grid,
  Icon,
  IconButton,
  ListItem,
  Table,
  Typography,
} from "@quimera/comps";
import { Backdrop, CircularProgress, Divider, Hidden, List } from "@quimera/thirdparty";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import { useEffect } from "react";

function DevolucionDetalle({ idPedido, callbackCerrado, useStyles }) {
  const [
    {
      idPedido: idPedidoState,
      lineasDevolucion,
      validacionLineasDevolucion,
      pedido,
      procesandoDevolucion,
      esComercial,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  useEffect(() => {
    idPedido !== idPedidoState &&
      dispatch({
        type: "onInit",
        payload: { idPedido, callbackCerrado },
      });
  }, [idPedido, callbackCerrado, dispatch]);

  return (
    <Quimera.Template id="DevolucionDetalle">
      <Container disableGutters={width === "xs" || width === "sm"} className={classes.container}>
        {idPedido && (
          <>
            <Box className={classes.cabeceraPedido}>
              <Box className={classes.cabeceraPedidoTitulo}>
                <IconButton id="cerrar" size="small" onClick={() => callbackCerrado()}>
                  <Icon>close</Icon>
                </IconButton>
                <Grid container size={12} direction="row" justifyContent="space-around" flex={1}>
                  <Grid className={classes.codigoPedido}>
                    <Typography variant="h5">{`Devolución  ${pedido?.codigo}`}</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="h5">{`${util.formatDate(pedido?.fecha)}`}</Typography>
                  </Grid>
                  <Grid>
                    <Typography variant="h5">{`${util.euros(pedido?.total)}`}</Typography>
                  </Grid>
                </Grid>
              </Box>
              <Grid size={12} className={classes.gridConfirmar}>
                <Grid>
                  <Typography variant="subtitle1">{pedido?.nombreCliente}</Typography>
                </Grid>
                <Grid>
                  <Button
                    id="prepararDevolucion"
                    variant="contained"
                    color="secondary"
                    size="large"
                    text="Confirmar devolución"
                    disabled={
                      procesandoDevolucion ||
                      esComercial ||
                      lineasDevolucion?.list.every(
                        linea => !linea.cantidadOk && !linea.cantidadKo,
                      ) ||
                      validacionLineasDevolucion?.some(
                        linea => linea.cantidadOk?.error || linea.cantidadKo?.error,
                      )
                    }
                  />
                </Grid>
              </Grid>
              <Divider />
            </Box>
            <Divider />
            <Hidden smDown>
              <Table
                id="tdbLineas"
                idField="id"
                schema={getSchemas().lineasDevolucion}
                px={2}
                data={lineasDevolucion?.list ?? []}
              >
                <Column.Schema
                  id="referencia"
                  width={100}
                  value={(linea, idx, arr) =>
                    idx === 0 || linea.idLineaPc !== arr[idx - 1]?.idLineaPc ? linea.referencia : ""
                  }
                />
                <Column.Schema
                  id="descripcion"
                  width={160}
                  flexGrow={1}
                  value={(linea, idx, arr) =>
                    idx === 0 || linea.idLineaPc !== arr[idx - 1]?.idLineaPc
                      ? linea.descripcion
                      : ""
                  }
                />
                <Column.Schema
                  id="cantidadFactura"
                  width={80}
                  value={(linea, idx, arr) =>
                    linea.idLineaPc !== arr[idx - 1]?.idLineaPc ? linea.cantidadFactura : null
                  }
                />
                <Column.Schema id="codigo" align="center" width={100} />
                <Column.Schema id="fechaCaducidad" width={140} />
                <Column.Action
                  id="cantidadOk"
                  className={classes.numberColumnEditable}
                  header="Correcta"
                  align="right"
                  width={80}
                  value={(linea, idx) => (
                    <Field.Float
                      id={`cantidadOk/${idx}`}
                      field="cantidadOk"
                      value={linea.cantidadOk ?? 0.0}
                      index={idx}
                      error={validacionLineasDevolucion?.[idx]?.cantidadOk?.error}
                      helperText={validacionLineasDevolucion?.[idx]?.cantidadOk?.message ?? ""}
                      disabled={esComercial}
                    />
                  )}
                />
                <Column.Action
                  id="cantidadKo"
                  className={classes.numberColumnEditable}
                  header="Dañada"
                  align="right"
                  width={80}
                  value={(linea, idx) => (
                    <Field.Float
                      id={`cantidadKo/${idx}`}
                      field="cantidadKo"
                      value={linea.cantidadKo ?? 0.0}
                      index={idx}
                      error={validacionLineasDevolucion?.[idx]?.cantidadKo?.error}
                      helperText={validacionLineasDevolucion?.[idx]?.cantidadKo?.message ?? ""}
                      disabled={esComercial}
                    />
                  )}
                />
                <Column.Action
                  id="limpiarCantidadesColumn"
                  header="Limpiar"
                  align="center"
                  width={80}
                  value={(linea, idx) => (
                    <IconButton id="limpiarCantidades" data={{ index: idx }}>
                      <Icon>cancel</Icon>
                    </IconButton>
                  )}
                />
              </Table>
            </Hidden>
            <Hidden mdUp>
              <List>
                {lineasDevolucion.list.map((linea, idx, arr) => (
                  <ListItem
                    key={linea.id}
                    divider={true}
                    px={3}
                    disableGutters
                    className={classes.listItem}
                  >
                    {idx === 0 || linea.referencia !== arr[idx - 1]?.referencia ? (
                      <article className={classes.avatarCantidad}>
                        {linea.cantidadFactura ?? 0}
                      </article>
                    ) : (
                      <article className={classes.avatarEmpty}></article>
                    )}
                    <article className={classes.lineaDevolItem}>
                      <section>
                        {(idx === 0 || linea.referencia !== arr[idx - 1]?.referencia) && (
                          <>
                            <span>
                              <strong>{linea.referencia}</strong>
                            </span>
                            <span variant="subtitle1" className={classes.descripcion}>
                              {linea.descripcion}
                            </span>
                          </>
                        )}
                      </section>
                      <section>
                        <span>Lote: {linea.codigo}</span>
                        <span>Caducidad: {util.formatDate(linea.fechaCaducidad)}</span>
                      </section>
                      <section
                        style={{
                          flexWrap: "nowrap",
                        }}
                      >
                        <Field.Float
                          id={`cantidadOk/${idx}`}
                          field="cantidadOk"
                          label="Devuelto"
                          value={linea.cantidadOk ?? 0.0}
                          index={idx}
                          error={validacionLineasDevolucion?.[idx]?.cantidadOk?.error}
                          helperText={validacionLineasDevolucion?.[idx]?.cantidadOk?.message ?? ""}
                          disabled={esComercial}
                          margin="none"
                        />
                        <Field.Float
                          id={`cantidadKo/${idx}`}
                          field="cantidadKo"
                          label="Dañado"
                          value={linea.cantidadKo ?? 0.0}
                          index={idx}
                          error={validacionLineasDevolucion?.[idx]?.cantidadKo?.error}
                          helperText={validacionLineasDevolucion?.[idx]?.cantidadKo?.message ?? ""}
                          disabled={esComercial}
                          margin="none"
                        />
                        <IconButton id="limpiarCantidades" data={{ index: idx }}>
                          <Icon>cancel</Icon>
                        </IconButton>
                      </section>
                    </article>
                  </ListItem>
                ))}
              </List>
            </Hidden>
          </>
        )}
      </Container>
      <Backdrop className={classes.backdrop} open={false}>
        <Box align="center">
          Preparando devolución&nbsp;&nbsp;
          <br />
          <CircularProgress />
        </Box>
      </Backdrop>
    </Quimera.Template>
  );
}

export default DevolucionDetalle;
