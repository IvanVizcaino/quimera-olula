import {
  Box,
  Column,
  Dialog,
  Field,
  Grid,
  Icon,
  IconButton,
  QBox,
  QBoxButton,
  QModelBox,
  QSection,
  QTitleBox,
  Table,
  Typography,
} from "@quimera/comps";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import { useEffect, useState } from "react";

import { ModalInventarioAlVuelo, ModaLotesLinea, Ubicacion } from "../../comps";

function dameColorLinea(linea) {
  let colorLinea = "white";
  const total = linea.totalEnAlbaran;
  const shcant = linea.shCantAlbaran;
  const cantidad = linea.cantidad;
  if (linea.estadoPDA == "Preparado" && shcant <= cantidad - total) {
    colorLinea = "#4478DE";
  } else if (linea.cerradaPDA) {
    colorLinea = "#EC971F";
  } else if (shcant > cantidad - total) {
    colorLinea = "#D32F2F";
  } else if (shcant == cantidad - total) {
    colorLinea = "#449D44";
  }

  return colorLinea;
}
function ShPreparacionDePedido({
  callbackChanged,
  codPreparacionDePedido,
  initPreparacion,
  useStyles,
}) {
  const [
    {
      lineas,
      logic,
      preparacion,
      vistaDetalle,
      modalLotesAlmacenVisible,
      modalLotesInventarioVisible,
      ordenLineas,
      cantidadAnadir,
      ubicaciones,
      codBarras,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const mobile = ["xs", "sm", "md"].includes(width);
  const [anchoDescripcionCalculado, setAnchoDescripcionCalculado] = useState(700);

  const dataLineas = lineas.idList
    .filter(id => lineas.dict[id].shPreparacion == "En Curso")
    .map(id => lineas.dict[id]);

  useEffect(() => {
    util.publishEvent(preparacion.event, callbackChanged);
  }, [preparacion.event.serial]);

  useEffect(() => {
    if (mobile && dataLineas.length > 0) {
      const maxChars = Math.max(...dataLineas.map(l => (l.descripcion || "").length));
      const anchoEstimado = Math.min(Math.max(150, maxChars * 8.5 + 40), 900);

      setAnchoDescripcionCalculado(anchoEstimado);
    } else {
      setAnchoDescripcionCalculado(700);
    }
  }, [dataLineas, mobile]);

  useEffect(() => {
    !!initPreparacion &&
      dispatch({
        type: "onInitPreparacion",
        payload: {
          initPreparacion,
        },
      });
    !initPreparacion &&
      !!codPreparacionDePedido &&
      dispatch({
        type: "onInitPreparacionById",
        payload: {
          filterPreparacion: ["codpreparaciondepedido", "eq", codPreparacionDePedido],
        },
      });
  }, [initPreparacion, codPreparacionDePedido]);

  const onKeyPressed = (event, preparacion) => {
    (event.key === "Enter" || event.key === "Tab") &&
      dispatch({
        type: "onLecturaCodBarras",
        payload: {
          codBarras: event.target.value,
          preparacion: preparacion.buffer.codPreparacionDePedido,
        },
      });
    (event.key === "Enter" || event.key === "Tab") &&
      dispatch({
        type: "clearCodBarras",
        payload: {},
      });
  };

  const estilosUbicacion = {
    box: {
      activada: classes.ubicacionBox,
      desactivada: classes.ubicacionBox,
      inhabilitada: classes.ubicacionBox,
    },
  };

  const onUbicacionChange = (event, linea) => {
    // event.key === "Enter" &&
    //   dispatch({
    //     type: "onLecturaCodBarras",
    //     payload: {
    //       codBarras: event.target.value,
    //       preparacion: preparacion.buffer.codPreparacionDePedido,
    //     },
    //   });
  };

  const onKeyCantidadPressed = (event, linea) => {
    event.key === "Enter" &&
      dispatch({
        type: "onCantidadLineaEnter",
        payload: {
          nuevaCantidadLinea: event.target.value.replace(".", "").replace(",", "."),
          idLinea: linea.idLinea,
        },
      });
  };

  const onCantidadBlur = (event, linea) => {
    dispatch({
      type: "onCantidadLineaBlurr",
      payload: {
        nuevaCantidadLinea: event.target.value.replace(".", "").replace(",", "."),
        idLinea: linea.idLinea,
        cantidadLinea: linea.shCantAlbaran,
      },
    });
  };

  const callbackFocus = () => {
    if (document.getElementById("codBarras")) {
      document.getElementById("codBarras").select();
    }
  };

  // const anchoDetalle = mobile ? 1 : 0.5;
  const anchoDetalle = 1;
  const schema = getSchemas().preparacionPedidos;
  const editable = true;

  // if (!initPreparacion || initPreparacion?._status === "deleted") {
  //   return null;
  // }

  return (
    <Quimera.Template id="PreparacionDetalle">
      {preparacion && (
        <QBox
          sx={{ overflow: "hidden", m: 1 }}
          maxWidth="100vw"
          titulo={`Preparación ${preparacion.buffer.codPreparacionDePedido}`}
          botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
          className={classes.preparacionBOX}
          width={anchoDetalle}
        >
          <QModelBox id="preparacion.buffer" disabled={!editable} schema={schema}>
            {vistaDetalle === "principal" ? (
              <Box sx={{ overflow: "hidden", m: 1 }}>
                <QBoxButton
                  id="deletePreparacion"
                  title="Borrar preparacion"
                  icon="delete"
                  color="primary"
                  disabled={!editable}
                />
                <Box>
                  <QSection
                    title="Descripción"
                    actionPrefix="preparacion.buffer"
                    alwaysInactive={!editable}
                    dynamicComp={() => (
                      <Box width={1}>
                        <Field.TextArea id="preparacion.buffer.descripcion" label="" fullWidth />
                      </Box>
                    )}
                  >
                    <Box display="flex">
                      <Typography variant="body2">
                        {preparacion.buffer.descripcion || ""}
                      </Typography>
                    </Box>
                  </QSection>
                  <Box display="flex" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Typography variant="h8">
                        {util.formatDate(preparacion.buffer.fecha)}
                      </Typography>
                    </Box>
                    <QTitleBox titulo="Ubic. inicial" className={classes.ubicacionBox}>
                      <Box display="flex" alignItems="flex-end" height="1.2rem">
                        <Typography ml={mobile ? 1 : null} variant="h8">{preparacion.buffer.ubicacionini}</Typography>
                      </Box>
                    </QTitleBox>
                    <QTitleBox titulo="Ubic. final" className={classes.ubicacionBox}>
                      <Box display="flex" alignItems="flex-end" height="1.2rem">
                        <Typography ml={mobile ? 1 : null} variant="h8">{preparacion.buffer.ubicacionfin}</Typography>
                      </Box>
                    </QTitleBox>
                  </Box>
                </Box>
                {lineas.idList.length > 0 && <Typography variant="overline">LÍNEAS</Typography>}
                {/* <Box display="flex" justifyContent="flex-start">
                  <Box flexGrow={1}>
                    <Field.Text
                      id="codBarras"
                      label="Cod. Barras"
                      inputProps={{ maxLength: 30 }}
                      fullWidth
                      value={codBarras}
                      onClick={event => event.target.select()}
                      onKeyDown={event => onKeyPressed(event, preparacion)}
                      autoFocus
                    />
                  </Box>
                </Box> */}

                {/* {mobile && ( */}
                <Box sx={{ overflow: "auto", width: "auto" }}>
                  <Table
                    id="tdbLineasPedidoCli"
                    idField="id"
                    className={mobile ? classes.TablaLineasPedidoCli : classes.TablaLineasPedidoCli}
                    data={dataLineas}
                    clickMode="line"
                    orderColumn={ordenLineas}
                    bgcolorRowFunction={linea => dameColorLinea(linea)}
                  >
                    {/* <Column.Action
                      id="actionCompletarLinea"
                      value={linea => (
                        <IconButton
                          id="completarLinea"
                          color="primary"
                          onClick={() =>
                            dispatch({
                              type: "onCompletarLineaLoteClicked",
                              payload: { idLinea: linea.idLinea },
                            })
                          }
                        >
                          <Icon className={classes.iconoCabecera}>done</Icon>
                        </IconButton>
                      )}
                    /> */}
                    <Column.Action
                      id="actioncerrarLinea"
                      value={linea => (
                        <IconButton
                          id="cerrarLinea"
                          color="primary"
                          onClick={() =>
                            dispatch({
                              type: "onCerrarLineaClicked",
                              payload: { idLineaCerrar: linea.idLinea },
                            })
                          }
                        >
                          <Icon className={classes.iconoCabecera}>
                            {linea.cerradaPDA ? "lock" : "lock_open"}
                          </Icon>
                        </IconButton>
                      )}
                    />
                    <Column.Action
                      id="actionverpedido"
                      value={linea => (
                        <IconButton
                          id="verPedido"
                          color="green"
                          onClick={() =>
                            dispatch({
                              type: "onVerPedidoClicked",
                              payload: { urlPedido: `/generarpreparaciones/${linea.idPedido}` },
                            })
                          }
                        >
                          <Icon className={classes.iconoCabecera}>edit</Icon>
                        </IconButton>
                      )}
                    />
                    <Column.Decimal
                      id="pendiente"
                      header="Pte."
                      order="pendiente"
                      pl={1}
                      value={linea => parseFloat(linea.cantidad) - parseFloat(linea.totalEnAlbaran)}
                      width={50}
                    />
                    <Column.Action
                      id="aenviar"
                      className={classes.numberColumnEditable}
                      header="A env"
                      order="aenv"
                      align="right"
                      width={80}
                      value={(linea, idx) => (
                        <>
                          {!linea.porLotes && (
                            <Field.Float
                              id={`cantidad/${idx}`}
                              field="cantidad"
                              value={Math.abs(linea.shCantAlbaran) ?? 0.0}
                              index={idx}
                              onClick={event => event.target.select()}
                              onKeyPress={event => onKeyCantidadPressed(event, linea)}
                              onBlur={event => onCantidadBlur(event, linea)}
                            />
                          )}
                          {linea.porLotes &&
                            (linea.shCantAlbaran
                              ? parseFloat(linea.shCantAlbaran).toFixed(2)
                              : "0.00")}
                        </>
                      )}
                    />
                    <Column.Text
                      id="descripcion"
                      header="descripcion"
                      order="descripcion"
                      pl={2}
                      value={linea => linea.descripcion}
                      width={anchoDescripcionCalculado}
                    />
                    {/* <Column.Text
                      id="ubicacion"
                      header="Ubicacion"
                      order="sh_codubicacionarticulo"
                      value={linea => linea.codUbicacionArticulo}
                      width={30}
                    /> */}
                    <Column.Action
                      id="actioncodubicacion"
                      width={110}
                      header="Ubic."
                      order="sh_codubicacionarticulo"
                      value={(linea, idx) => (
                        <Grid container direction="column" spacing={1}>
                          <Grid size={12}>
                            <Ubicacion
                              id="linea/codUbicacionArticulo"
                              value={linea.codUbicacionArticulo}
                              ubicaciones={ubicaciones.map(ubicacion => ({
                                key: ubicacion.codUbicacion,
                                value: ubicacion.codUbicacion,
                                option: ubicacion,
                              }))}
                              index={linea.idLinea}
                              // codUbicacion={linea.codUbicacionArticulo}
                              fullWidth
                              async
                            />
                          </Grid>
                        </Grid>
                      )}
                    />
                    {/* <Column.Action
                      id="actioncodubicacion"
                      width={90}
                      header="Ubic."
                      order="sh_codubicacionarticulo"
                      value={(linea, idx) => (
                        <QSection
                          title=""
                          actionPrefix="linea.buffer"
                          save={{ display: "none" }}
                          cancel={{ display: "none" }}
                          estilos={estilosUbicacion}
                          dynamicComp={() => (
                            <Grid container direction="column" spacing={1}>
                              <Grid size={12}>
                                <Ubicacion
                                  id="linea/codUbicacionArticulo"
                                  value={linea.codUbicacionArticulo}
                                  ubicaciones={ubicaciones.map(ubicacion => ({
                                    key: ubicacion.codUbicacion,
                                    value: ubicacion.codUbicacion,
                                    option: ubicacion,
                                  }))}
                                  index={linea.idLinea}
                                  // codUbicacion={linea.codUbicacionArticulo}
                                  fullWidth
                                  async />
                              </Grid>
                            </Grid>

                          )}
                        >
                          <Box display="flex">
                            <Typography variant="body2">
                              {linea.codUbicacionArticulo || ""}
                            </Typography>
                          </Box>
                        </QSection>

                      )}
                    /> */}
                    <Column.Text
                      id="refprov"
                      header="Ref. Prov"
                      order="refprov"
                      pl={2}
                      value={linea => linea.referenciaProv}
                      width={180}
                    />
                    <Column.Text
                      id="codPedido"
                      header="Pedido"
                      order="codpedido"
                      pl={2}
                      value={linea => linea.codPedido}
                      width={125}
                    />
                    <Column.Decimal
                      id="totalenalbaran"
                      header="Serv."
                      order="totalenalbaran"
                      pl={2}
                      value={linea => linea.totalEnAlbaran}
                      width={50}
                    />
                    <Column.Decimal
                      id="cantidad"
                      header="Cant."
                      order="cantidad"
                      pl={2}
                      value={linea => linea.cantidad}
                      width={110}
                    />
                    <Column.Decimal
                      id="disponible"
                      header="Stock Disp."
                      order="disponible"
                      pl={2}
                      value={linea => linea.dispLotesAlmacen.toFixed(2)}
                      width={80}
                    />
                    <Column.Text
                      id="referencia"
                      header="Nombre"
                      order="refrencia"
                      pl={2}
                      value={linea => linea.referencia}
                      width={160}
                    />
                    <Column.Action
                      id="actionInventarioVuelo"
                      value={linea => (
                        <IconButton
                          id="inventarioAlVuelo"
                          onClick={() =>
                            dispatch({
                              type: "onInventarioAlVuelo",
                              payload: { idLinea: linea.idLinea },
                            })
                          }
                        >
                          <Icon>content_paste</Icon>
                        </IconButton>
                      )}
                    />
                  </Table>
                </Box>
                {/* )} */}
                {/* <List disablePadding>
                  {!mobile && (
                    lineas.idList.map(item => {
                      // console.log("Cambiando item", item, lineas.dict[item])
                      return (
                        <ListItemLineaPreparacion
                          key={lineas.dict[item].codigo}
                          model={lineas.dict[item]}
                          linea={lineas.dict[item]}
                          modalLotesAlmacenVisible={modalLotesAlmacenVisible}
                          disabled={false}
                          callbackCambiada={() => dispatch({ type: "getLineas" })}
                          callbackFocus={callbackFocus}
                          dispatch={dispatch}
                        />
                      );
                    })
                  )}
                </List> */}
                <Dialog
                  open={modalLotesAlmacenVisible}
                  fullWidth
                  maxWidth="md"
                  fullScreen={width === "xs" || width === "sm"}
                  onClose={() => dispatch({ type: "onCerrarModalLotesAlmacen" })}
                >
                  <ModaLotesLinea
                    key="ModaLotesLinea"
                    disabled={false}
                    dispatch={dispatch}
                    codPrepracionPedido={preparacion.buffer.codPreparacionDePedido}
                  />
                </Dialog>
                <Dialog
                  open={modalLotesInventarioVisible}
                  fullWidth
                  maxWidth="md"
                  fullScreen={width === "xs" || width === "sm"}
                  onClose={() => dispatch({ type: "onCerrarModalLotesInventario" })}
                >
                  <ModalInventarioAlVuelo
                    key="modalLotesInventario"
                    disabled={false}
                    dispatch={dispatch}
                  />
                </Dialog>
              </Box>
            ) : (
              <Box width={1}></Box>
            )}
          </QModelBox>
        </QBox>
      )}
    </Quimera.Template>
  );
}

export default ShPreparacionDePedido;
