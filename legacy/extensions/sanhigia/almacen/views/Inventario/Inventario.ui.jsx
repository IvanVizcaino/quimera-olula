import {
  Box,
  Button,
  Column,
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
import { useCallback, useEffect, useRef } from "react";

// import { LineaInventario } from "@quimera-extension/base-almacen";

function dameColorLinea(linea) {
  let colorLinea = "";
  if (linea.sh_estado == "Cerrada") {
    colorLinea = "#449D44";
  } else if (linea.cantidadIni != linea.cantidad) {
    colorLinea = "#2D95C1";
  } else {
    colorLinea = "#EC971F";
  }

  return colorLinea;
}

function Inventario({ callbackChanged, codInventario, initInventario, useStyles }) {
  const [{ lineas, inventario, vistaDetalle, todasLasLineas, order }, dispatch] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const ultimaLongitudPaginada = useRef(-1);

  const onScrollTablaInventario = event => {
    if (lineas?.page?.next === null) return;
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const cercaDelFinal = scrollHeight - scrollTop - clientHeight < 100;
    if (cercaDelFinal && ultimaLongitudPaginada.current !== lineas.idList.length) {
      ultimaLongitudPaginada.current = lineas.idList.length;
      dispatch({ type: "onNextLineas" });
    }
  };

  useEffect(() => {
    util.publishEvent(inventario.event, callbackChanged);
  }, [inventario.event.serial]);

  useEffect(() => {
    !!initInventario &&
      dispatch({
        type: "onInitInventario",
        payload: {
          initInventario,
        },
      });
    !initInventario &&
      !!codInventario &&
      dispatch({
        type: "onInitInventarioById",
        payload: {
          filterInventario: ["codinventario", "eq", codInventario],
        },
      });
  }, [initInventario, codInventario]);

  // useCallback necesario para que no salte el useEffect de onInit en cada render de LineaPedidoCliNueva
  const callbackNuevaLinea = useCallback(
    payload => dispatch({ type: "onLineaCreada", payload }),
    [dispatch],
  );

  const handleChangeLinea = e => {
    console.log("handlechangelinea");
    dispatch({ type: "getLineas" });
    // setAEnviar(e.item.shCantAlbaran || 0);
    // callbackFocus();
  };

  // const handleChangeLinea = () => {
  //   dispatch({
  //     type: "onCerrarLineaSuccess",
  //   });
  // };

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = 1;
  const schema = getSchemas().inventarios;
  const editable = inventario.buffer.estado === "Abierto"; //logic.pedidoEditable(pedido.data)

  if ((!initInventario && !codInventario) || initInventario?._status === "deleted") {
    return null;
  }

  if (codInventario && !inventario.data.codInventario) {
    return null;
  }

  const onKeyCantidadPressed = (event, linea) => {
    event.key === "Enter" &&
      dispatch({
        type: "onCantidadLineaEnter",
        payload: { nuevaCantidadLinea: event.target.value, idLinea: linea.idLinea },
      });
  };

  const onCantidadBlur = (event, linea) => {
    // console.log(event.target.value);
    // console.log(linea.cantidad)
    if (parseFloat(event.target.value) != parseFloat(linea.cantidad)) {
      console.log("cambia");
      dispatch({
        type: "onCantidadLineaBlurr",
        payload: {
          nuevaCantidadLinea: parseFloat(event.target.value.replace(".", "").replace(",", ".")),
          idLinea: linea.idLinea,
          cantidadLinea: parseFloat(linea.cantidadFin),
        },
      });
    }
  };

  const handleLineasVisibles = lineas => {
    const cerradas = lineas.idList.filter(idLinea => lineas.dict[idLinea].sh_estado === "Cerrada");
    const abiertas = lineas.idList.filter(idLinea => lineas.dict[idLinea].sh_estado !== "Cerrada");
    const lineasAver = todasLasLineas ? [...cerradas, ...abiertas] : [...abiertas];
    return lineasAver;
  };
  const dataLineas = handleLineasVisibles(lineas)
    .filter(id => lineas.dict[id].sh_estado !== "Inventariada")
    .map(id => lineas.dict[id])
    .sort((a, b) => {
      const fieldA = a[order.field];
      const fieldB = b[order.field];

      // Convertir null/undefined a string vacío para poder comparar
      const valueA = (fieldA === null || fieldA === undefined) ? '' : fieldA;
      const valueB = (fieldB === null || fieldB === undefined) ? '' : fieldB;

      // Comparación para números
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return order.direction === 'ASC' ? valueA - valueB : valueB - valueA;
      }

      // Comparación para strings (incluyendo vacíos)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return order.direction === 'ASC'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });

  // console.log(lineas?.page?.next);

  return (
    <Quimera.Template id="Inventario">
      {inventario && (
        <QBox
          sx={{ overflow: "hidden", m: 1 }}
          maxWidth="100vw"
          width={anchoDetalle}
          noHeight={true}
          titulo={`Inventario ${inventario.data.codInventario}`}
          botonesCabecera={[
            // { icon: 'more_horiz', id: 'mas', text: 'Más' },
            { icon: "arrow_back", id: "atras", text: "Atrás" },
          ]}
          sideButtons={
            <>
              {/* <QBoxButton id='deletePedido' title='Borrar pedido' icon='delete'
                disabled={!editable}
              />
              <Quimera.Block id='sideButtons' /> */}
            </>
          }
        >
          <QModelBox id="inventario.buffer" schema={schema} style={{ overflow: "hidden" }}>
            {vistaDetalle === "principal" ? (
              <Box>
                <QTitleBox titulo="Almacén">
                  <Typography variant="h5">{`${inventario.buffer.codAlmacen} - ${inventario.buffer.nombreAlmacen}`}</Typography>
                </QTitleBox>
                <QTitleBox titulo="Fecha">
                  <Box display="flex" alignItems="center">
                    <Box mr={1}>
                      <Icon color="action" fontSize="default">
                        event
                      </Icon>
                    </Box>
                    <Typography variant="h5">{util.formatDate(inventario.buffer.fecha)}</Typography>
                  </Box>
                </QTitleBox>

                <Grid size={12}>
                  <QSection
                    title="Observaciones"
                    actionPrefix="inventario.buffer"
                    alwaysInactive={!editable}
                    dynamicComp={() => (
                      <Box width={1}>
                        <Field.TextArea id="inventario.buffer.observaciones" label="" fullWidth />
                      </Box>
                    )}
                  >
                    <Box display="flex">
                      <Typography variant="body2">
                        {inventario.buffer.observaciones || "Sin observaciones"}
                      </Typography>
                    </Box>
                  </QSection>
                </Grid>

                <Box my={2}>
                  <Box width={1} display="flex" alignItems="center" justifyContent="center">
                    <Button
                      id="cerrarAbrirInventario"
                      text={editable ? "Cerrar inventario" : "Abrir inventario"}
                      variant="outlined"
                      color="primary"
                      startIcon={<Icon>{editable ? "arrow_circle_down" : "arrow_circle_up"}</Icon>}
                      onClick={() => {
                        dispatch({
                          type: "onCerrarAbrirInventarioClicked",
                          payload: { codInventario: inventario.buffer.codInventario },
                        });
                      }}
                    />
                  </Box>
                </Box>

                {editable && (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <QTitleBox titulo={"Líneas"}></QTitleBox>
                      <Box display="flex" justifyContent="flex-end">
                        <QBoxButton
                          id="mostrarFiltroLineas"
                          title="Mostrar filtro"
                          icon="filter_alt"
                        />
                        <QBoxButton
                          id="verTodo"
                          title={todasLasLineas ? "Solo abiertas" : "Ver todo"}
                          icon={todasLasLineas ? "visibility_off" : "visibility"}
                        />
                      </Box>
                    </Box>
                    <Quimera.SubView id="Inventario/LineasFiltro" />
                    {/* <QListModel
                      data={handleLineasVisibles(lineas)}
                      // title="Líneas "
                      modelName="lineas"
                      ItemComponent={LineaInventario}
                      itemProps={{
                        variant: "section",
                      }}
                      disabled={!editable}
                    />
                    Hola */}

                    {/* {
                      handleLineasVisibles(lineas).map(h => (
                        <>
                          <ListItemLineaInventario
                            key={h}
                            linea={lineas.dict[h]}
                            disabled={!editable}
                            dispatch={dispatch}
                            callbackCambiada={handleChangeLinea}
                          />
                        </>
                      ))
                    } */}

                    {
                      <Box
                        id="scrollableTableInventarios"
                        style={{ overflow: "auto", height: `calc(100vh - 500px)` }}
                        onScroll={onScrollTablaInventario}
                      >
                        <Table
                          id="tdbLineasInventario"
                          idField="id"
                          className={classes.tdbLineasInventario}
                          data={dataLineas}
                          clickMode="line"
                          next={() => dispatch({ type: "onNextLineas" })}
                          hasMore={lineas?.page?.next !== null}
                          orderColumn={order}
                          bgcolorRowFunction={linea => dameColorLinea(linea)}
                        >
                          <Column.Action
                            id="actioncerrarLinea"
                            width={35}
                            value={linea => (
                              <IconButton
                                id="cerrarLinea"
                                color="primary"
                                onClick={() =>
                                  dispatch({
                                    type: "onCerrarLineaClicked",
                                    payload: { idLinea: linea.idLinea },
                                  })
                                }
                              >
                                <Icon className={classes.iconoCabecera}>
                                  {linea.cerradaPDA ? "lock" : "lock_open"}
                                </Icon>
                              </IconButton>
                            )}
                          />
                          <Column.Decimal
                            id="cantidadIni"
                            header="Cant.Ini."
                            order="cantidadIni"
                            pl={1}
                            value={linea => parseFloat(linea.cantidadIni)}
                            width={90}
                          />
                          <Column.Action
                            id="cantidad"
                            className={classes.numberColumnEditable}
                            header="Cant.Fin."
                            order="cantidad"
                            align="right"
                            width={90}
                            value={(linea, idx) => (
                              <>
                                <Field.Float
                                  id={`cantidad/${idx}`}
                                  field="cantidad"
                                  value={Math.abs(linea.cantidad) ?? 0.0}
                                  index={idx}
                                  onClick={event => event.target.select()}
                                  onKeyPress={event => onKeyCantidadPressed(event, linea)}
                                  onBlur={event => onCantidadBlur(event, linea)}
                                />
                              </>
                            )}
                          />
                          <Column.Text
                            id="descripcion"
                            header="Descripcion"
                            order="descripcion"
                            pl={2}
                            value={linea => linea.desArticulo}
                            width={550}
                          />
                          <Column.Text
                            id="codigolote"
                            header="Código lote"
                            order="codigolote"
                            pl={2}
                            value={linea => linea.codigolote}
                            width={240}
                          />
                          <Column.Text
                            id="referencia"
                            header="Referencia"
                            order="referencia"
                            pl={2}
                            value={linea => linea.referencia}
                            width={110}
                          />
                          <Column.Text
                            id="referenciaProv"
                            header="Referencia Prov."
                            order="referenciaProv"
                            pl={2}
                            value={linea => linea.referenciaProv}
                            width={170}
                          />
                        </Table>
                      </Box>
                    }
                  </>
                )}
              </Box>
            ) : (
              <Box width={1}>
                <DocAgente />
              </Box>
            )}
          </QModelBox>
        </QBox>
      )}
    </Quimera.Template>
  );
}

export default Inventario;
