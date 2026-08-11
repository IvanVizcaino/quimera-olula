import { DocAgente, DocClienteYDir, DocDirCliente } from "@quimera-extension/base-ventas";
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
  Table,
  Typography,
} from "@quimera/comps";
import { List } from "@quimera/thirdparty";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import React, { useEffect, useState } from "react";

import { ListItemPedidoVenta, ModaAsociarBarcode, ModaLotesLinea, Ubicacion } from "../../comps";

function dameColorLinea(linea) {
  let colorLinea = "white";
  const total = linea.totalEnAlbaran;
  const shcant = linea.shCantAlbaran;
  const cantidad = linea.cantidad;
  if (linea.estadoPDA == "Preparado" && shcant <= cantidad - total) {
    colorLinea = "#4478DE";
  } else if (linea.cerradaPDA) {
    colorLinea = "#2D95C1";
  } else if (shcant > cantidad - total) {
    colorLinea = "#D32F2F";
  } else if (shcant == cantidad - total) {
    colorLinea = "#449D44";
  }

  return colorLinea;
}

const Lineas = ({ lineas, dispatch, disabled, initPedido, classes }) => {
  // console.log("mimensaje_RERENDERING LINEAS", lineas);
  if (lineas.idList.length === 0) {
    return <></>;
  }
  useEffect(() => {
    document.getElementById("codBarras").focus();
  }, [initPedido]);

  const callbackFocus = () => {
    if (document.getElementById("codBarras")) {
      document.getElementById("codBarras").select();
    }
  };

  const callbackCambiada = () => {
    dispatch({
      type: "onLineaCambiada",
    });
  };

  // const onKeyPressed = (event, initPedido) => {
  //   event.key === "Enter" &&
  //     dispatch({
  //       type: "onLecturaCodBarras",
  //       payload: { codBarras: event.target.value, pedido: initPedido.idPedido },
  //     });
  // };

  // const onKeyCantidadPressed = (event, linea) => {
  //   event.key === "Enter" &&
  //     dispatch({
  //       type: "onCantidadLineaCambiada",
  //       payload: { nuevaCantidadLinea: event.target.value, idLinea: linea.idLinea },
  //     });
  // };

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);

  return (
    <Box mt={1}>
      {lineas.idList.length > 0 && <Typography variant="overline">Líneas</Typography>}
      <List disablePadding>
        {lineas.idList.map(h => (
          <>
            <ListItemPedidoVenta
              key={h}
              linea={lineas.dict[h]}
              disabled={disabled}
              dispatch={dispatch}
              callbackFocus={callbackFocus}
              callbackCambiada={callbackCambiada}
            />
          </>
        ))}
      </List>
    </Box>
  );
};

const LineasMemo = React.memo(Lineas);

function PedidoGenerarPreparaciones({ callbackChanged, callbackPedidoEnviadoPda, idPedido, initPedido, useStyles }) {
  const [
    {
      lineas,
      logic,
      modalEnviarAPda,
      pedido,
      status,
      vistaDetalle,
      modalLotesAlmacenVisible,
      modalAsociarBarcodeVisible,
      ubicaciones,
      codBarras,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const [anchoDescripcionCalculado, setAnchoDescripcionCalculado] = useState(600);
  const [anchoPteCalculado, setAnchoPteCalculado] = useState(50);
  const [anchoServidoCalculado, setAnchoServidoCalculado] = useState(80);
  const [anchoCantCalculado, setAnchoCantCalculado] = useState(80);
  const [anchoAEnviarCalculado, setAnchoAEnviarCalculado] = useState(80);
  const mobile = ["xs", "sm"].includes(width);

  const dataLineas = lineas.idList.map(id => lineas.dict[id]);

  useEffect(() => {
    dispatch({
      type: "onGuardarCallbacks",
      payload: {
        callbackChanged,
        callbackPedidoEnviadoPda,
      },
    });
  }, [dispatch]);

  useEffect(() => {
    util.publishEvent(pedido.event, callbackChanged);
  }, [pedido.event.serial]);

  useEffect(() => {
    if (mobile && dataLineas.length > 0) {
      const maxCharsDescripcion = Math.max(...dataLineas.map(l => (l.descripcion || "").length));
      const anchoEstimadoDescripcion = Math.min(Math.max(150, maxCharsDescripcion * 8.5 + 40), 900);

      const maxCharsPte = Math.max(...dataLineas.map(l => ((parseFloat(l.cantidad) - parseFloat(l.canServida)) || "").toString().length));
      const anchoEstimadoPte = Math.min(Math.max(50, maxCharsPte * 7.5 + 40), 150);

      const maxCharsServido = Math.max(...dataLineas.map(l => (l.totalEnAlbaran || "").length));
      const anchoEstimadoServido = Math.min(Math.max(70, maxCharsServido * 7.5 + 40), 150);

      const maxCharsCant = Math.max(...dataLineas.map(l => (l.cantidad || "").length));
      const anchoEstimadoCant = Math.min(Math.max(70, maxCharsCant * 7.5 + 40), 150);

      const maxCharsAEnviar = Math.max(...dataLineas.map(l => (Math.abs(l.shCantAlbaran) || 0).toString().length));
      const anchoEstimadoAEnviar = Math.min(Math.max(70, maxCharsAEnviar * 7.5 + 40), 150);

      setAnchoDescripcionCalculado(anchoEstimadoDescripcion);
      setAnchoPteCalculado(anchoEstimadoPte);
      setAnchoServidoCalculado(anchoEstimadoServido);
      setAnchoCantCalculado(anchoEstimadoCant);
      setAnchoAEnviarCalculado(anchoEstimadoAEnviar);
    } else {
      setAnchoDescripcionCalculado(600);
      setAnchoPteCalculado(70);
      setAnchoServidoCalculado(70);
      setAnchoCantCalculado(70);
      setAnchoAEnviarCalculado(70);
    }
  }, [dataLineas, mobile]);

  useEffect(() => {
    !!initPedido &&
      dispatch({
        type: "onInitPedido",
        payload: {
          initPedido,
          callbackChanged,
        },
      });
    !initPedido &&
      !!idPedido &&
      dispatch({
        type: "onInitPedidoById",
        payload: {
          action: "get_generar_preparaciones",
          idPedido,
          callbackChanged,
        },
      });
  }, [initPedido, idPedido]);

  const callbackCambiada = () => {
    dispatch({
      type: "onLineaCambiada",
    });
  };

  const onKeyPressed = (event, initPedido) => {
    (event.key === "Enter" || event.key === "Tab") &&
      dispatch({
        type: "onLecturaCodBarras",
        payload: { codBarras: event.target.value, pedido: pedido.data.idPedido },
      });
    (event.key === "Enter" || event.key === "Tab") &&
      dispatch({
        type: "clearCodBarras",
        payload: {},
      });
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

  const lineaBloqueada = (linea) => {
    return (linea.dtoLineal !== 0 && (linea.shCantAlbaran ?? 0) !== 0 && parseFloat(linea.cantidad) !== (parseFloat(linea.canServida + linea.shCantAlbaran)))
  };



  const anchoDetalle = 1;
  const schema = getSchemas().pedidos;
  const editable = logic.pedidoEditable(pedido.data);

  if ((!initPedido && !idPedido) || initPedido?._status === "deleted") {
    return null;
  }

  if (idPedido && !pedido.data.idPedido) {
    return null;
  }

  // console.log("***********************");
  // console.log(ubicaciones.map(ubicacion => ({
  //   key: ubicacion.codUbicacion,
  //   value: ubicacion.codUbicacion,
  //   option: ubicacion,
  // })));

  return (
    <Quimera.Template id="PedidoGenerarPreparaciones">
      {pedido && (
        <QBox
          width={anchoDetalle}
          maxWidth="100vw"
          className={classes.preparacionBOX}
          titulo={`Pedido ${pedido.data.codigo}`}
          botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
          sideButtons={
            <>
              <QBoxButton
                id="enviarPDA"
                title="Enviar"
                icon="send"
                disabled={pedido.buffer?.estadoPda !== "Preparado" || status.enviandoPda}
                busy={status.enviandoPda}
              />
              <QBoxButton
                id="quitarTrabajador"
                title="Quitar trabajador"
                icon="person_remove"
                disabled={
                  !pedido.buffer?.codTrabajador ||
                  pedido.buffer?.estadoPda !== "Pendiente" ||
                  pedido.buffer.servido === "Sí"
                }
              />
            </>
          }
        >
          {vistaDetalle === "principal" ? (
            <Box sx={{ overflow: "hidden", m: 1 }}>
              <QModelBox id="pedido.buffer" disabled schema={schema}>
                {pedido.buffer.observaciones && (
                  <QSection title="Observaciones" actionPrefix="pedido.buffer" alwaysInactive>
                    <Box display="flex">
                      <Typography variant="h5" style={{ color: "red" }}>
                        {pedido.buffer.observaciones}
                      </Typography>
                    </Box>
                  </QSection>
                )}
                <DocClienteYDir disabled />
                <DocDirCliente />

                <Grid container direction="column" spacing={1}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <QSection
                      title={`Trabajador asignado: ${pedido.buffer.codTrabajador || ""}`}
                      actionPrefix="pedido.buffer/codTrabajador"
                      alwaysInactive
                    >
                      <Box display="flex">
                        <Typography variant="body1">
                          {pedido.buffer.nombreTrabajador || "Sin asignar"}
                        </Typography>
                      </Box>
                    </QSection>
                  </Grid>

                  {pedido.buffer.descPreparaciones && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <QSection
                        title="Preparaciones"
                        actionPrefix="pedido.descPreparaciones"
                        alwaysInactive
                      >
                        <Box display="flex">
                          <Typography variant="body2">{pedido.buffer.descPreparaciones}</Typography>
                        </Box>
                      </QSection>
                    </Grid>
                  )}
                </Grid>
              </QModelBox>

              <Box display="inline-flex" justifyContent="center" visibility={status.lineasConDto === true ? "visible" : "hidden"}>
                <Box mt={1} display="flex" justifyContent="center" sx={{
                  border: '2px solid red',
                  borderRadius: 2,
                  padding: 1
                }}>
                  <Typography variant="body1" textAlign="center">
                    {"Hay lineas con descuento informado. Se deben servir completamente"}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="flex-start">
                <Box flexGrow={1}>
                  <Field.Text
                    id="codBarras"
                    label="Cod. Barras"
                    inputProps={{ maxLength: 30 }}
                    fullWidth
                    value={codBarras}
                    onClick={event => event.target.select()}
                    onKeyDown={event => onKeyPressed(event, initPedido)}
                    autoFocus
                  />
                </Box>
              </Box>

              {/* {mobile && ( */}
              {/* <Box> */}
              <Box sx={{ overflow: "auto" }}>
                <Table
                  id="TablaLineasPedidoCli"
                  idField="id"
                  className={classes.TablaLineasPedidoCli}
                  data={lineas.idList.map(id => lineas.dict[id])}
                  clickMode="line"
                  orderColumn="idLinea"
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
                  {/* Hay que deshabilitar el boton si tiene un descuento y no tenemos el total informado */}
                  <Column.Action
                    id="actioncerrarLinea"
                    value={linea => (
                      <IconButton
                        id="cerrarLinea"
                        onClick={() =>
                          dispatch({
                            type: "onCerrarLineaClicked",
                            payload: { idLineaCerrar: linea.idLinea },
                          })
                        }
                        disabled={lineaBloqueada(linea)}
                      >
                        {/* {console.log('mimensaje_lineas', linea.referencia, "dto", linea.dtoLineal, "cantAlb", linea.shCantAlbaran, "cantidad", parseFloat(linea.cantidad), "canServ", linea.canServida, "total", parseFloat(linea.canServida + linea.shCantAlbaran), linea.shCantAlbaran !== 0.0)} */}
                        <Icon className={lineaBloqueada(linea) ? classes.iconoBloqueado : classes.iconoCabecera}>
                          {linea.cerradaPDA ? "lock" : "lock_open"}
                        </Icon>
                      </IconButton>
                    )}
                  />
                  <Column.Decimal
                    id="pendiente"
                    header="Pte."
                    order="pendiente"
                    pl={1}
                    value={linea => parseFloat(linea.cantidad) - parseFloat(linea.canServida)}
                    width={anchoPteCalculado}
                  // width={50}
                  />
                  <Column.Action
                    id="aenviar"
                    className={classes.numberColumnEditable}
                    header="A env"
                    align="right"
                    width={anchoAEnviarCalculado}
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
                        {linea.porLotes && (Math.abs(linea.shCantAlbaran).toFixed(2) ?? 0.0)}
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
                    order="codubicacion"
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
                            ubicaciones={ubicaciones?.map(ubicacion => ({
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
                  <Column.Text
                    id="refprov"
                    header="Ref. Prov"
                    order="refprov"
                    pl={2}
                    value={linea => linea.referenciaProv}
                    width={180}
                  />
                  <Column.Decimal
                    id="totalenalbaran"
                    header="Serv."
                    order="ubicacion"
                    pl={2}
                    value={linea => linea.totalEnAlbaran}
                    width={anchoServidoCalculado}
                  />
                  <Column.Decimal
                    id="cantidad"
                    header="Cant."
                    order="cantidad"
                    pl={2}
                    value={linea => linea.cantidad}
                    width={anchoCantCalculado}
                  />
                  <Column.Decimal
                    id="disponible"
                    header="Stock Disp."
                    order="disponible"
                    pl={2}
                    value={linea =>
                      linea.dispLotesAlmacen > 0 ? linea.dispLotesAlmacen.toFixed(2) : 0
                    }
                    width={80}
                  />
                  <Column.Text
                    id="referencia"
                    header="Nombre"
                    order="referencia"
                    pl={2}
                    value={linea => linea.referencia}
                    width={180}
                  />
                  <Column.Text
                    id="dtolineal"
                    header="Serv. total"
                    order="dtolineal"
                    pl={2}
                    value={linea => linea.dtoLineal !== 0 ? "Si" : "No"}
                    width={80}
                    align="center"
                  />
                </Table>
              </Box>

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
                  idPedido={idPedido}
                />
              </Dialog>
              <Dialog
                open={modalAsociarBarcodeVisible}
                fullWidth
                classes={{ paper: classes.paper38auto }}
                fullScreen={width === "xs" || width === "sm"}
                onClose={() => dispatch({ type: "onCerrarModaAsociarBarcode" })}
              >
                <ModaAsociarBarcode
                  key="ModaAsociarBarcode"
                  lineas={lineas}
                  disabled={false}
                  dispatch={dispatch}
                />
              </Dialog>
            </Box>
          ) : (
            <Box width={1}>
              <QModelBox id="pedido.buffer" disabled={!editable} schema={schema}>
                <DocAgente />
              </QModelBox>
            </Box>
          )}
        </QBox>
      )}

      {modalEnviarAPda && (
        <Quimera.SubView
          id="PedidoGenerarPreparaciones/EnviarAPda"
          // idModeloProp={idModelo}
          callbackVolver={() => dispatch({ type: "cerrarModalEnviarAPda" })}
        />
      )}
    </Quimera.Template>
  );
}

export default PedidoGenerarPreparaciones;
