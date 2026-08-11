import { DocAgente } from "@quimera-extension/base-ventas";
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

import {
  ListItemLineaPedidoCompra,
  ModaAsociarBarcode,
  ModaLotesLinea,
  Ubicacion,
} from "../../comps";

const Lineas = ({ lineas, dispatch, disabled, initPedido }) => {
  // console.log("mimensaje_RERENDERING LINEAS", lineas);

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

  return (
    <Box mt={1}>
      {lineas.idList.length > 0 && <Typography variant="overline">Líneas</Typography>}

      <List disablePadding>
        {lineas.idList.map(h => (
          <>
            <ListItemLineaPedidoCompra
              key={h}
              linea={lineas.dict[h]}
              disabled={disabled}
              dispatch={dispatch}
              callbackCambiada={callbackCambiada}
              callbackFocus={callbackFocus}
            />
          </>
        ))}
      </List>
    </Box>
  );
};

const LineasMemo = React.memo(Lineas);
function dameColorLinea(linea) {
  let colorLinea = "white";
  const total = linea.totalEnAlbaran;
  const shcant = linea.shCantAlbaran;
  const cantidad = linea.cantidad;
  if (linea.cerradaPDA) {
    colorLinea = "#2D95C1";
  } else if (total + shcant == cantidad) {
    colorLinea = "#449D44";
  } else if (total + shcant > 0 && total + shcant < cantidad) {
    colorLinea = "#EC971F";
  } else if (total + shcant > cantidad) {
    colorLinea = "yellow";
  }

  return colorLinea;
}
function PedidoCompra({ callbackChanged, idPedido, initPedido, useStyles }) {
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
      ordenLineas,
      procesandoGenerarAlbaran,
      ubicaciones,
      codBarras,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const [anchoDescripcionCalculado, setAnchoDescripcionCalculado] = useState(600);
  const mobile = ["xs", "sm"].includes(width);

  const dataLineas = lineas.idList.map(id => lineas.dict[id]);

  useEffect(() => {
    util.publishEvent(pedido.event, callbackChanged);
  }, [pedido.event.serial]);

  useEffect(() => {
    if (mobile && dataLineas.length > 0) {
      const maxChars = Math.max(...dataLineas.map(l => (l.descripcion || "").length));
      const anchoEstimado = Math.min(Math.max(150, maxChars * 8.5 + 40), 900);
      setAnchoDescripcionCalculado(anchoEstimado);
    } else {
      setAnchoDescripcionCalculado(600);
    }
  }, [dataLineas, mobile]);

  const onKeyPressed = (event, initPedido) => {
    (event.key === "Enter" || event.key === "Tab") &&
      dispatch({
        type: "onLecturaCodBarras",
        payload: { codBarras: event.target.value, pedido: idPedido },
      });
    (event.key === "Enter" || event.key === "Tab") &&
      dispatch({
        type: "clearCodBarras",
        payload: {},
      });
  };

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
          action: "get_pedidos_compra",
          idPedido,
          callbackChanged,
        },
      });
  }, [initPedido, idPedido]);

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

  const anchoDetalle = mobile ? "1" : "0.5";
  const schema = getSchemas().pedidosCompra;
  const editable = logic.pedidoEditable(pedido.data);

  if ((!initPedido && !idPedido) || initPedido?._status === "deleted") {
    return null;
  }

  if (idPedido && !pedido.data.idPedido) {
    return null;
  }

  return (
    <Quimera.Template id="PedidoCompra">
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
                disabled={pedido.buffer?.estadoPda !== "Preparado"}
              />
              <QBoxButton
                id="generarAlbaran"
                title="Generar Albaran"
                icon="article"
                disabled={procesandoGenerarAlbaran || pedido.buffer?.estadoPda !== "Listo PDA"}
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

                <Grid container direction="column" spacing={1}>
                  {/* <Grid size={{ xs: 12, sm: 6 }}>
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
                  </Grid> */}

                  {pedido.buffer.nombre && (
                    <Grid size={{ xs: 12, sm: 12 }}>
                      <QSection title="" actionPrefix="pedido.nombre" alwaysInactive>
                        <Box display="flex">
                          <Typography variant="h6">{pedido.buffer.nombre}</Typography>
                        </Box>
                      </QSection>
                    </Grid>
                  )}
                </Grid>
              </QModelBox>
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
              <Box sx={{ overflow: "auto" }}>
                <Table
                  id="tdbLineasPedidoCli"
                  idField="id"
                  className={classes.TablaLineasPedidoCli}
                  data={lineas.idList.map(id => lineas.dict[id])}
                  clickMode="line"
                  orderColumn={ordenLineas}
                  bgcolorRowFunction={linea => dameColorLinea(linea)}
                >
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
                      >
                        <Icon className={classes.iconoCabecera}>
                          {linea.cerradaPDA ? "lock" : "lock_open"}
                        </Icon>
                      </IconButton>
                    )}
                  />
                  <Column.Action
                    id="irAMovilotes"
                    value={linea => (
                      <IconButton
                        id="irAMovilotes"
                        color="green"
                        onClick={() => {
                          linea.porLotes &&
                            dispatch({
                              type: "irAMovilotes",
                              payload: { idLinea: linea.idLinea, idPedido: linea.idPedido },
                            });
                        }}
                      >
                        <Icon className={classes.iconoCabecera}>edit</Icon>
                      </IconButton>
                    )}
                  />
                  <Column.Decimal
                    id="cantidad"
                    header="Cant.."
                    order="cantidad"
                    pl={1}
                    value={linea => parseFloat(linea.cantidad)}
                    width={65}
                  />
                  <Column.Action
                    id="recibir"
                    className={classes.numberColumnEditable}
                    header="Recibir"
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
                        {linea.porLotes && (Math.abs(linea.shCantAlbaran).toFixed(2) ?? 0.0)}
                      </>
                    )}
                  />
                  <Column.Text
                    id="descripcion"
                    header="Descripcion"
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
                          {/* {console.log('mimensaje_________ubicacion', linea.codUbicacionArticulo)} */}
                          <Ubicacion
                            id="linea/codUbicacionArticulo"
                            value={linea.codUbicacionArticulo}
                            index={linea.idLinea}
                            ubicaciones={ubicaciones.map(ubicacion => ({
                              key: ubicacion.codUbicacion,
                              value: ubicacion.codUbicacion,
                              option: ubicacion,
                            }))}
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
                    width={50}
                  />
                  <Column.Decimal
                    id="cantidad"
                    header="Cant."
                    order="cantidad"
                    pl={2}
                    value={linea => linea.cantidad}
                    width={80}
                  />
                  <Column.Text
                    id="referencia"
                    header="Referencia"
                    order="referencia"
                    pl={2}
                    value={linea => linea.referencia}
                    width={180}
                  />
                </Table>
              </Box>
              {/* )}
              {!mobile && (
                <LineasMemo
                  lineas={lineas}
                  dispatch={dispatch}
                  disabled={!editable}
                  initPedido={initPedido}
                />

              )} */}
              <Dialog
                open={modalLotesAlmacenVisible}
                fullWidth
                maxWidth="md"
                fullScreen={width === "xs" || width === "sm"}
                onClose={() => dispatch({ type: "onCerrarModalLotesAlmacen" })}
              >
                <ModaLotesLinea key="ModaLotesLinea" disabled={false} dispatch={dispatch} />
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
          id="PedidoCompra/EnviarAPda"
          // idModeloProp={idModelo}
          callbackVolver={() => dispatch({ type: "cerrarModalEnviarAPda" })}
        />
      )}
    </Quimera.Template>
  );
}

export default PedidoCompra;
