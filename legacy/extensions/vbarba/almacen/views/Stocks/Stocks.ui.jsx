import {
  Box,
  Button,
  Column,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Icon,
  IconButton,
  QMasterDetail,
  Table,
  Typography,
} from "@quimera/comps";
import { CircularProgress, LinearProgress } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";
import { useCallback, useEffect } from "react";

import { QAlmacenesVbarba, QArticuloVbarba } from "../../comps";

function Stocks({ useStyles, idRefStockProp, referenciaArticulo }) {
  const [
    { estadoVista, creandoStock, stocks, lectura, miFinca, modalCrearStockVisible },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);

  useEffect(() => {
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      payload: { nombre: referenciaArticulo ? "Artículo" : `Stock${idRefStockProp ? "" : "s"}` },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch, idRefStockProp, referenciaArticulo]);

  useEffect(() => {
    dispatch({
      type: "onInit",
    });
  }, [dispatch]);

  useEffect(() => {
    const refArticulo = idRefStockProp
      ? idRefStockProp
      : referenciaArticulo
        ? referenciaArticulo
        : null;
    dispatch({
      type: "onIdStocksProp",
      payload: { id: refArticulo },
    });
  }, [idRefStockProp, referenciaArticulo]);

  const callbackStockCambiado = useCallback(
    payload => dispatch({ type: "onStocksItemChanged", payload }),
    [],
  );

  const handleTextoFiltro = event => {
    event.stopPropagation();
    const value = event.target.value;
    const filtro = {
      or: [
        ["descripcion", "like", value],
        ["referencia", "like", value],
        ["codbarras", "like", value],
      ],
    };
    dispatch({ type: "onLecturaChanged", payload: { value } });
    if (event.keyCode === 13) {
      dispatch({ type: "onFiltroChanged", payload: { value, filtro } });
    }
  };

  return (
    <Quimera.Template id="Stocks">
      {miFinca?.codfinca ? (
        <QMasterDetail
          variant="fullscreen"
          sx={{ overflow: "hidden", m: 1 }}
          maxWidth="100vw"
          MasterComponent={
            <Container>
              <Box mx={1} my={1}>
                <Grid container direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }} >
                    <QArticuloVbarba
                      id="referencia"
                      label={`Lectura${lectura ? ` (${lectura})` : ""}`}
                      boxStyle={classes.referencia}
                      onKeyDown={handleTextoFiltro}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 6, md: 4 }} pb={1} style={{
                    textAlign: mobile ? "left" : "center",
                    margin: mobile ? "30px 0px 10px 0px" : "inherit"
                  }}>
                    <Typography variant="subtittle1">
                      {`Finca: ${miFinca?.descripcion}`}
                    </Typography>
                  </Grid>


                  <Grid size={{ xs: 6, md: 4 }} pb={1} style={{
                    textAlign: "right",
                    margin: mobile ? "30px 0px 10px 0px" : "inherit"
                  }}>
                    <Button
                      id="crearStocks"
                      onClick={() =>
                        dispatch({
                          type: `onCrearStockClicked`,
                        })
                      }
                    >
                      Crear registro stocks
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              {estadoVista === "lanzando" && <LinearProgress />}
              {estadoVista === "lanzadoConResultados" && (
                <Box id="scrollableTablaStocks" sx={{ overflow: "auto", width: "auto" }}>
                  <Table
                    id="tdbStocks"
                    idField="referencia"
                    data={Object.values(stocks.dict)}
                    clickMode="line"
                    loader={null}
                    orderColumn={stocks.order}
                    next={payload =>
                      dispatch({
                        type: "onNextStocks",
                        payload: { getStocksParams: { codFinca: miFinca?.codfinca }, ...payload },
                      })
                    }
                    hasMore={stocks.page.next !== null}
                    bgcolorRowFunction={linea => (linea.disponible ? "#ace1af" : "inherit")}
                    scrollableTarget="scrollableTablaStocks"
                  >
                    <Column.Action
                      id="imagenButton"
                      value={linea => (
                        <IconButton
                          id="verImagen"
                          size="small"
                          tooltip={linea.tieneFoto ? "Ver imagen" : "No tiene imagen asociada"}
                          disabled={!linea.tieneFoto}
                          onClick={() =>
                            dispatch({
                              type: "onVerImagenClicked",
                              payload: { referencia: linea.referencia },
                            })
                          }
                        >
                          <Icon
                            size="small"
                            className={linea.tieneFoto ? classes.tieneFoto : classes.noTieneFoto}
                          >
                            image
                          </Icon>
                        </IconButton>
                      )}
                    />
                    <Column.Action
                      id="disponibleButton"
                      value={linea => (
                        <IconButton
                          id="actualizarDisponible"
                          size="small"
                          tooltip={
                            linea.disponible ? "Actualizar no disponible" : "Actualizar disponible"
                          }
                          onClick={() =>
                            dispatch({
                              type: "onCambiarDisponibleClicked",
                              payload: { data: linea },
                            })
                          }
                        >
                          <Icon>credit_card</Icon>
                        </IconButton>
                      )}
                    />
                    <Column.Text
                      id="referencia"
                      header="Referencia"
                      order="referencia"
                      pl={2}
                      value={stock => stock.referencia}
                      width={150}
                      flexGrow={1}
                    />
                    <Column.Action
                      id="publicadoWebButton"
                      value={linea => (
                        <IconButton
                          id="actualizarPublicadoWeb"
                          size="small"
                          tooltip={linea.publicadoWeb ? "Publicado web" : "No publicado web"}
                          onClick={() =>
                            dispatch({
                              type: "onPublicadoWebClicked",
                              payload: { data: linea },
                            })
                          }
                        >
                          <Icon
                            className={linea.publicadoWeb ? classes.tieneFoto : classes.noTieneFoto}
                          >
                            {linea.publicadoWeb ? "visibility" : "visibility_off"}
                          </Icon>
                        </IconButton>
                      )}
                    />
                    <Column.Text
                      id="descripcion"
                      header="Descripcion"
                      order="descripcion"
                      pl={2}
                      value={stock => stock.descripcion}
                      flexGrow={2}
                      width={300}
                    />
                    <Column.Decimal
                      id="precioRef"
                      header="Precio referencia"
                      order="precioRef"
                      flexGrow={2}
                      decimals={2}
                      value={stock => stock.precioRef}
                    />
                    <Column.Text
                      id="disponible"
                      header="Disponible"
                      order="disponible"
                      pl={2}
                      value={stock => (stock.disponible ? "Si" : "No")}
                      flexGrow={2}
                      align="right"
                    />
                  </Table>
                </Box>
              )}
              {estadoVista === "lanzadoSinResultados" && (
                <Box mt={4} display="flex" justifyContent="center">
                  <Typography component="span" variant="h6">
                    No existen registros para este criterio de búsqueda
                  </Typography>
                </Box>
              )}
              <Dialog open={modalCrearStockVisible}>
                <DialogTitle id="form-dialog-title">
                  {"Crear registro de stock para almacén"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="form-dialog-description">
                    <Box>
                      <QArticuloVbarba
                        id="referencia"
                        label={`Lectura${lectura ? ` (${lectura})` : ""}`}
                        boxStyle={classes.referencia}
                        onKeyDown={handleTextoFiltro}
                        fullWidth
                      />
                      <QAlmacenesVbarba
                        id="codalmacen"
                        label={`Selecciona almacen`}
                        boxStyle={classes.referencia}
                        codFinca={miFinca?.codfinca}
                        // codAlmacenDefecto={miFinca?.codalmacendefecto}
                        fullWidth
                      />
                    </Box>
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Grid container size={12} justifyContent="space-between" mb={2} spacing={2}>
                    <Grid size={6} display="flex" justifyContent="flex-start">
                      <Button
                        id="cancelarCrearStock"
                        text="Cancelar"
                        color="primary"
                        variant="contained"
                      />
                    </Grid>
                    <Grid size={6} display="flex" justifyContent="flex-end">
                      <Button
                        id="aceptarCrearStock"
                        text={!creandoStock ? "Aceptar" : "Creando"}
                        color="secondary"
                        variant="contained"
                        disabled={creandoStock}
                      >
                        {creandoStock && (
                          <CircularProgress size={24} color="white" style={{ marginLeft: 10 }} />
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </DialogActions>
              </Dialog>
            </Container>
          }
          DetailComponent={
            idRefStockProp ? (
              <Quimera.View
                id="Stock"
                initStock={stocks.dict[stocks.current]}
                referencia={stocks.current}
                callbackChanged={callbackStockCambiado}
                callbackVolver={payload => dispatch({ type: "actualizarCurrent", payload })}
              />
            ) : (
              referenciaArticulo && (
                <Quimera.View
                  id="Articulo"
                  referenciaArticulo={referenciaArticulo}
                  callbackVolver={payload =>
                    dispatch({ type: "recargarStockDesdeArticulo", payload })
                  }
                />
              )
            )
          }
          current={stocks.current}
        />
      ) : (
        <Container>
          <Quimera.View
            id="CambiarFinca"
            callbackCerrar={() => dispatch({ type: "onInit" })}
            titulo="Stocks"
          />
        </Container>
      )}
    </Quimera.Template>
  );
}

export default Stocks;
