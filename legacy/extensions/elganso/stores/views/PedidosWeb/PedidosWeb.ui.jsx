import { styled } from '@mui/material/styles';
import "./PedidosWeb.style.scss";

import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from "@mui/material/Switch";
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid, QuickFilter, QuickFilterClear, QuickFilterControl, QuickFilterTrigger, Toolbar, ToolbarButton
} from "@mui/x-data-grid";
import { Button, Container, Dialog, DialogActions, DialogTitle } from "@quimera/comps";
import Quimera, { PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";
import Select from "react-select";

// import { BarcodeScanner } from "../../comps";
import { PedidoWeb } from "../../comps";

const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
  marginLeft: 'auto',
});

const StyledToolbarButton = styled(ToolbarButton)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  width: 'min-content',
  height: 'min-content',
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity']),
}));

const StyledTextField = styled(TextField)(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  overflowX: 'clip',
  width: ownerState.expanded ? 260 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity']),
}));

function PedidosWeb({ useStyles }) {
  const [state, dispatch] = useStateValue();

  useEffect(() => {
    dispatch({
      type: "init",
      payload: {
        codTienda: util.getUser().codtienda
      },
    });
  }, []);

  const { pedidosWeb } = state;
  const [rowSelectionModel, setRowSelectionModel] = React.useState([]);
  const [filtroSeleccionado, setFiltroSeleccionado] = React.useState(null);
  const [abrirRegularizarFaltante, setDialogoRegularizarFaltante] = React.useState(false);
  const [faltantesRegSeleccionados, setFaltantesRegSeleccionados] = React.useState(false);
  const [abrirMarcarEnviadosError, setAbrirMarcarEnviadosError] = React.useState(false);
  const [pedidosMarcarEnviadosError, setPedidosMarcarEnviadosError] = React.useState();

  const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);

      return objectsByKeyValue;
    }, {});

  const groupIdtpvComanda = groupBy("idtpv_comanda");
  const groupById = groupBy("id");

  const lineasAgrupadasPorPedido = groupIdtpvComanda(pedidosWeb);
  const lineasAgrupadasPorId = groupById(pedidosWeb);

  const filtroLineas = lineas => {
    let lineasFiltradas = null;
    let lineasFiltradasAux = null;
    switch (filtroSeleccionado) {
      case 7:
        // "TODOS"
        //lineasFiltradas = lineas;
        setFiltroSeleccionado(null);

        break;
      case 1:
        // "POR PREPARAR"
        lineasFiltradasAux = lineas.filter(
          obj => obj.pedidopreparado === true,
        );
        if (lineasFiltradasAux.length === lineas.length) {
          lineasFiltradas = [];
        } else {
          lineasFiltradas = lineas;
        }
        lineasFiltradasAux = null;

        break;
      case 2:
        // "PENDIENTE TRANSPORTISTA"
        lineasFiltradasAux = lineas.filter(
          obj => obj.pedidopreparado === true && obj.pedidoenviado === false && obj.url === null && !obj.etiquetaimpresa,
        );
        if (lineasFiltradasAux.length === lineas.length) {
          lineasFiltradas = lineas;
        } else {
          lineasFiltradas = [];
        }
        lineasFiltradasAux = null;

        break;
      case 3:
        // "PENDIENTE IMPRIMIR"
        lineasFiltradasAux = lineas.filter(
          obj => obj.pedidopreparado === true && obj.pedidoenviado === false && obj.url !== null && !obj.etiquetaimpresa,
        );
        if (lineasFiltradasAux.length === lineas.length) {
          lineasFiltradas = lineas;
        } else {
          lineasFiltradas = [];
        }
        lineasFiltradasAux = null;

        break;
      case 4:
        // "PENDIENTE MARCAR ENVIADO"
        lineasFiltradasAux = lineas.filter(
          obj => obj.pedidopreparado === true && obj.pedidoenviado === false && (obj.url !== null || obj.recogidatienda && obj.codalmacen === obj.codtiendarecogida) && obj.etiquetaimpresa,
        );
        if (lineasFiltradasAux.length === lineas.length) {
          lineasFiltradas = lineas;
        } else {
          lineasFiltradas = [];
        }
        lineasFiltradasAux = null;

        break;
      case 5:
        // "RECOGIDA EN TIENDA"
        lineasFiltradasAux = lineas.filter(
          obj => obj.recogidatienda && obj.codalmacen === obj.codtiendarecogida,
        );
        if (lineasFiltradasAux.length === lineas.length) {
          lineasFiltradas = lineas;
        } else {
          lineasFiltradas = [];
        }
        lineasFiltradasAux = null;

        break;
      default:
        // "DEFAULT"
        break;
    }

    return lineasFiltradas;
  };

  const pedidosProcesados = lineasAgrupadas => {
    const pedidos = [];
    const keys = Object.keys(lineasAgrupadas);
    keys.forEach(key => {
      const pedido = {};
      pedido["idtpv_comanda"] = lineasAgrupadas[key][0]["idtpv_comanda"];
      pedido["fecha"] = lineasAgrupadas[key][0]["fecha"];
      pedido["hora"] = lineasAgrupadas[key][0]["hora"];
      pedido["codcomanda"] = lineasAgrupadas[key][0]["codcomanda"];
      pedido["pedidopreparado"] = lineasAgrupadas[key][0]["pedidopreparado"];
      pedido["etiquetaimpresa"] = lineasAgrupadas[key][0]["etiquetaimpresa"];
      pedido["pedidoenviado"] = lineasAgrupadas[key][0]["pedidoenviado"];
      pedido["regalo"] = lineasAgrupadas[key][0]["regalo"];
      pedido["mg_codpostalenv"] = lineasAgrupadas[key][0]["mg_codpostalenv"];
      pedido["recogidatienda"] = lineasAgrupadas[key][0]["recogidatienda"];
      pedido["codtiendarecogida"] = lineasAgrupadas[key][0]["codtiendarecogida"];
      pedido["cliente"] = lineasAgrupadas[key][0]["cliente"];
      pedido["direccion"] = lineasAgrupadas[key][0]["direccion"];
      pedido["mg_ciudadenv"] = lineasAgrupadas[key][0]["mg_ciudadenv"];
      pedido["mg_provinciaenv"] = lineasAgrupadas[key][0]["mg_provinciaenv"];
      pedido["mg_paisenv"] = lineasAgrupadas[key][0]["mg_paisenv"];
      pedido["iddirectorder"] = lineasAgrupadas[key][0]["iddirectorder"];
      pedido["codalmacen"] = lineasAgrupadas[key][0]["codalmacen"];
      pedido["packaging"] = lineasAgrupadas[key][0]["packaging"];
      pedido["lineas"] = lineasAgrupadas[key];
      pedido["lineasFiltradas"] = filtroLineas(lineasAgrupadas[key]);
      pedido["totalLineas"] = lineasAgrupadas[key].length;
      pedido["totalFaltantes"] = lineasAgrupadas[key].filter(
        obj => obj.faltantecreada === true,
      ).length;
      pedido["totalAnuladas"] = lineasAgrupadas[key].filter(
        obj => obj.pedidoanulado === true,
      ).length;
      pedido["totalEnviado"] = lineasAgrupadas[key].filter(
        obj => obj.pedidoenviado === true,
      ).length;
      pedido["totalImpreso"] = lineasAgrupadas[key].filter(
        obj => obj.etiquetaimpresa === true,
      ).length;
      pedido["totalPreparado"] = lineasAgrupadas[key].filter(
        obj => obj.pedidopreparado === true,
      ).length;
      pedido["totalEscaneado"] = lineasAgrupadas[key].filter(
        obj => obj.barcodeescaneado === true,
      ).length;
      pedido["totalEtiquetaAsignada"] = lineasAgrupadas[key].filter(obj => obj.url !== null).length;
      pedido["etiquetaUrl"] = null;
      if (lineasAgrupadas[key].filter(obj => obj.url !== null).length > 0) {
        pedido["etiquetaUrl"] = lineasAgrupadas[key].filter(obj => obj.url !== null)[0]["url"];
      }

      // Si el pedido no tiene filtro o si teniendolo tiene lineas se añade
      if (!Array.isArray(pedido["lineasFiltradas"]) || pedido["lineasFiltradas"].length > 0) {
        pedidos.push(pedido);
      }
    });

    return pedidos;
  };

  const renderPedido = params => {
    // eslint-disable-next-line camelcase
    const { idtpv_comanda } = params.row;
    const { abrirDialogoFaltante } = state;

    return (
      <PedidoWeb
        pedido={params}
        expanded={rowSelectionModel.includes(idtpv_comanda.toString()) ? true : false}
        setFiltroSeleccionado={setFiltroSeleccionado}
        abrirDialogoFaltante={abrirDialogoFaltante}
      />
    );
  };

  const columns = [
    {
      field: "codcomanda",
      headerName: "PEDIDO",
      sortable: false,
      flex: 0.9,
      resizable: false,
      renderCell: params => renderPedido(params),
    },
  ];

  const colorsArray = [
    { value: 1, label: "POR PREPARAR", color: "lightgrey" },
    { value: 2, label: "PENDIENTE TRANSPORTISTA", color: "#a5c3f7" },
    { value: 3, label: "PENDIENTE IMPRIMIR", color: "#a5c3f7" },
    { value: 4, label: "PENDIENTE MARCAR ENVIADO", color: "#c94aff" },
    { value: 5, label: "RECOGIDA EN TIENDA", color: "#80ac80" }
  ];
  const valueFromId = (opts, id) => opts.find(o => o.value === id);

  const CustomToolbar = () => {
    const { pedidosWeb } = state;

    const pedidosPorEnviar = pedidosWeb.filter(function (linea) {
      return rowSelectionModel.indexOf(String(linea.idtpv_comanda)) != -1;
    });

    let pedidosPorEnviarGrouped = null;
    const pedidosErroneos = [];

    const colorStyles = {
      control: (styles, state) => ({
        ...styles,
        background: '#fff',
        borderColor: '#9e9e9e',
        minHeight: '30px',
        height: '30px',
        boxShadow: state.isFocused ? null : null,
      }),

      valueContainer: (styles, state) => ({
        ...styles,
        height: '30px',
        lineHeight: '24px',
        padding: '0 6px',
      }),

      input: (styles, state) => ({
        ...styles,
        margin: '0px',
      }),
      indicatorSeparator: state => ({
        display: 'none',
      }),
      indicatorsContainer: (styles, state) => ({
        ...styles,
        height: '30px',
      }),

      option: (styles, { data }) => {
        return {
          ...styles,
          backgroundColor: data.color
        };
      },

      singleValue: (styles, { data }) => {
        return {
          ...styles,
          padding: '0 5px',
          backgroundColor: data.color
        };
      },
    };

    const handleChangeFiltro = (e) => {
      if (e.value) {
        setFiltroSeleccionado(e.value);
      }
    }

    return (
      <Toolbar className="toolbarContainer">
        <div className="toolbarContainer-subcontainer">
          <StyledQuickFilter>
            <QuickFilterTrigger
              render={(triggerProps, state) => (
                <Tooltip title="Buscar" enterDelay={0}>
                  <StyledToolbarButton
                    {...triggerProps}
                    ownerState={{ expanded: state.expanded }}
                    color="default"
                    aria-disabled={state.expanded}
                  >
                    <SearchIcon fontSize="small" />
                  </StyledToolbarButton>
                </Tooltip>
              )}
            />
            <QuickFilterControl
              className="quickFilter"
              render={({ ref, ...controlProps }, state) => (
                <StyledTextField
                  {...controlProps}
                  ownerState={{ expanded: state.expanded }}
                  inputRef={ref}
                  aria-label="Buscar"
                  placeholder="Buscar..."
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: state.value ? (
                        <InputAdornment position="end">
                          <QuickFilterClear
                            edge="end"
                            size="small"
                            aria-label="Limpiar"
                            material={{ sx: { marginRight: -0.75 } }}
                          >
                            <CancelIcon fontSize="small" />
                          </QuickFilterClear>
                        </InputAdornment>
                      ) : null,
                      ...controlProps.slotProps?.input,
                    },
                    ...controlProps.slotProps,
                  }}
                />
              )}
            />
          </StyledQuickFilter>
          <div className="row-Filtros">
            <Select
              defaultValue={valueFromId(colorsArray, filtroSeleccionado)}
              options={colorsArray}
              styles={colorStyles}
              placeholder="Filtrar"
              value={valueFromId(colorsArray, filtroSeleccionado)}
              onChange={handleChangeFiltro}
            />
          </div>
        </div>
        <Button
          id="buttonPedidosEnviados"
          className="buttonPedidosEnviados"
          text="Marcar Pedidos Como Enviados"
          variant="outlined"
          onClick={() => {
            if (pedidosPorEnviar.length > 0) {
              pedidosPorEnviarGrouped = groupIdtpvComanda(pedidosPorEnviar);

              Object.keys(pedidosPorEnviarGrouped).forEach(key => {
                pedidosPorEnviarGrouped[key].every(linea => {
                  if (!linea.etiquetaimpresa) {
                    pedidosErroneos.push(linea.codcomanda);

                    return false;
                  }

                  return true;
                });
              });
              if (rowSelectionModel.length > 0) {
                if (pedidosErroneos.length > 0) {
                  setPedidosMarcarEnviadosError(pedidosErroneos);
                  setAbrirMarcarEnviadosError(true);
                } else {
                  Object.keys(pedidosPorEnviarGrouped).forEach(key => {
                    dispatch({
                      type: "onMarcarComoEnviado",
                      payload: {
                        codcomanda: pedidosPorEnviarGrouped[key][0]["codcomanda"],
                      },
                    });
                  });
                }
              }
            }
          }}
        />
      </Toolbar>
    );
  };

  const handleChangeSwitch = (event, idLinea) => {
    const { faltantesRegularizar } = state;
    if (event.target.checked) {
      if (faltantesRegularizar.indexOf(idLinea) === -1) {
        faltantesRegularizar.push(idLinea);
      }
    } else if (faltantesRegularizar.indexOf(idLinea) !== -1) {
      faltantesRegularizar.splice(faltantesRegularizar.indexOf(idLinea), 1);
    }
    setFaltantesRegSeleccionados(faltantesRegularizar.length);
  };

  const render = () => {
    const {
      abrirDialogoFaltante,
      dialogFaltanteTitle,
      faltantesSeleccionados,
      faltantesRegularizar,
    } = state;

    const pedidos = pedidosProcesados(lineasAgrupadasPorPedido);

    return (
      <div id="PedidosWeb" className="page-container">
        <h2 className="main">Gestión Pedidos</h2>
        {/* <BarcodeScanner /> */}
        {filtroSeleccionado ? (
          <>
            <div className="filtrosFooter">
              <div>
                <span className="filtro-footer-label">Filtros aplicados:</span>
                <div>
                  <span className={`filtro-footer-selected-${valueFromId(colorsArray, filtroSeleccionado)["value"]}`}>
                    {valueFromId(colorsArray, filtroSeleccionado)["label"]}
                  </span>
                </div>

              </div>
              <Button
                id="limpiarFiltros"
                text="Limpiar"
                className="modalButton-ClearFilter"
                onClick={() => {
                  setFiltroSeleccionado(null);
                }}
              />
            </div>
          </>
        ) : null}
        <DataGrid
          className="dataGridPedidosWeb"
          rows={pedidos}
          disableAutosize
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnMenu
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={(newRowSelectionModel, details) => {
            if (newRowSelectionModel && typeof newRowSelectionModel === 'object' && 'ids' in newRowSelectionModel) {
              if (newRowSelectionModel.type == 'include') {
                const selectedProjectIds = Array.from(newRowSelectionModel.ids || []).map(id => String(id));
                setRowSelectionModel(selectedProjectIds);
              }

              // Si hacemos click en 'Select All' y es de tipo exclude marcamos todos las lineas de la tabla
              if (newRowSelectionModel.type == 'exclude') {
                const idsPedidos = Array.from(pedidos || []).map(pedido => String(pedido.idtpv_comanda));
                setRowSelectionModel(idsPedidos);
              }
            } else {
              setRowSelectionModel([]);
            }

          }}
          columns={columns}
          slots={{ toolbar: CustomToolbar }}
          localeText={{
            noRowsLabel: "No hay pedidos",
            toolbarQuickFilterPlaceholder: "Buscar...",
            paginationRowsPerPage: "Líneas por página",
            paginationDisplayedRows: ({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
            footerRowSelected: (count) =>
              count !== 1
                ? `${count} filas seleccionadas`
                : `${count} fila seleccionada`,
          }}
          getRowId={row => row.idtpv_comanda}
          getRowClassName={params => {
            return "rowPedido";
          }}
          getRowHeight={() => "auto"}
          sx={{
            ".MuiDataGrid-virtualScroller::-webkit-scrollbar": { display: "none" },
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              printOptions: { disableToolbarButton: true },
              csvOptions: { disableToolbarButton: true },
            }
          }}
          showToolbar
        />

        <Container>
          <Dialog open={abrirDialogoFaltante} fullWidth maxWidth="md">
            <DialogTitle id="form-dialog-title">{dialogFaltanteTitle}</DialogTitle>
            <DialogActions className="pedidosWebDialogAction">
              <div>
                <Button
                  id="marcarFaltanteDenegar"
                  text="No"
                  className="modalButton"
                  onClick={() => {
                    dispatch({
                      type: "dialogoFaltanteClose",
                    });
                  }}
                />
                <Button
                  id="marcarFaltanteAcceptar"
                  text="Sí"
                  className="modalButton"
                  onClick={() => {
                    setDialogoRegularizarFaltante(true);
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>
        </Container>

        <Container>
          <Dialog open={abrirRegularizarFaltante} fullWidth maxWidth="md">
            <DialogTitle id="form-dialog-title">¿REGULARIZAR FALTANTES?</DialogTitle>
            <div>
              {faltantesSeleccionados.map(idLinea => (
                <div className="rowRegularizarFaltantes">
                  <div className="regularizarFaltantesDescripcion">
                    <div className="descripcion">
                      {lineasAgrupadasPorId[idLinea][0]["descripcion"]}
                    </div>
                    <div>
                      {lineasAgrupadasPorId[idLinea][0]["referencia"]}
                      {lineasAgrupadasPorId[idLinea][0]["talla"] !== "TU"
                        ? `- ${lineasAgrupadasPorId[idLinea][0]["talla"]}`
                        : null}
                    </div>
                  </div>
                  <div className="regularizarFaltantesAcciones">
                    <Switch
                      id={`switchRegularizar-${idLinea}`}
                      onChange={e => {
                        handleChangeSwitch(e, idLinea);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <DialogActions className="pedidosWebDialogAction">
              <div>
                <Button
                  id="cancelarAvisoFaltante"
                  text="Cancelar"
                  className="modalButtonCancelar"
                  onClick={() => {
                    setDialogoRegularizarFaltante(false);
                    setFaltantesRegSeleccionados(false);
                    dispatch({
                      type: "dialogoFaltanteClose",
                    });
                  }}
                />
                <Button
                  id="aceptarAvisoFaltante"
                  text="Omitir"
                  className="modalButton"
                  onClick={() => {
                    faltantesSeleccionados.forEach(idLinea => {
                      dispatch({
                        type: "onMarcarComoFaltante",
                        payload: {
                          id: idLinea,
                        },
                      });
                    });
                    setDialogoRegularizarFaltante(false);
                    setFaltantesRegSeleccionados(false);
                    dispatch({
                      type: "dialogoFaltanteClose",
                    });
                  }}
                />
                <Button
                  id="aceptarAvisoFaltante"
                  text="Regularizar"
                  className={
                    faltantesRegSeleccionados ? "modalButton" : "modalButton modalButton-NoActivo"
                  }
                  onClick={() => {
                    if (faltantesRegSeleccionados) {
                      faltantesSeleccionados.forEach(idLinea => {
                        dispatch({
                          type: "onMarcarComoFaltante",
                          payload: {
                            id: idLinea,
                          },
                        });
                      });
                      setDialogoRegularizarFaltante(false);
                      setFaltantesRegSeleccionados(false);
                      dispatch({
                        type: "marcarFaltantesRegularizados",
                        payload: {
                          faltantesRegularizar: JSON.stringify(faltantesRegularizar),
                        },
                      });
                      dispatch({
                        type: "dialogoFaltanteClose",
                      });
                    }
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>
        </Container>

        <Container>
          <Dialog open={abrirMarcarEnviadosError} fullWidth maxWidth="md">
            <div className="pedidosEnviadosError-Title">
              Existen pedidos con lineas sin resolver.
            </div>
            <div className="pedidosEnviadosError-Wrapper">
              <div>Pedidos afectados: </div>
              {pedidosMarcarEnviadosError
                ? pedidosMarcarEnviadosError.map(pedido => (
                  <div className="pedidosEnviadosError">{pedido}</div>
                ))
                : null}
            </div>
            <DialogActions>
              <div>
                <Button
                  id="cerrarAvisoError"
                  text="Cerrar"
                  className="modalButton"
                  onClick={() => {
                    setPedidosMarcarEnviadosError([]);
                    setAbrirMarcarEnviadosError(false);
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>
        </Container>
      </div>
    );
  };

  return <Quimera.Template id="PedidosWeb">{render()}</Quimera.Template>;
}

PedidosWeb.propTypes = PropValidation.propTypes;
PedidosWeb.defaultProps = PropValidation.defaultProps;
export default PedidosWeb;
