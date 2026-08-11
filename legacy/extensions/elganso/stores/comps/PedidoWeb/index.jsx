import "./PedidoWeb.style.scss";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Icon,
  IconButton,
} from "@quimera/comps";
import PropTypes from "prop-types";
import { useStateValue } from "quimera";
import React from "react";
import useSound from "use-sound";

import errorSound from "../../../../../apps/elganso-stores/assets/sound/error.mp3";
import successSound from "../../../../../apps/elganso-stores/assets/sound/success.mp3";
import { NumeroBultos } from "../../comps";

function PedidoWeb({ _estilos, ...props }) {
  const [_, dispatch] = useStateValue();
  const [rowFaltanteSelectionModel, setFaltanteSelectionModel] = React.useState([]);
  const [rowNumBultos, setRowNumBultos] = React.useState(1);
  const [rowPackaging, setRowPackaging] = React.useState(null);
  const [abrirDialogoFaltanteAviso, setAbrirDialogoFaltanteAviso] = React.useState(false);
  const [abrirDialogoNumBultos, setAbrirDialogoNumBultos] = React.useState(false);
  const [abrirDialogoPackaging, setAbrirDialogoPackaging] = React.useState(false);
  const [msgBarcodeClass, setMsgBarcodeClass] = React.useState();
  const [msgBarcode, setMsgBarcode] = React.useState("Haga click para escanear");
  const [scannerValue, setScannerValue] = React.useState();
  const [localExpanded, setLocalExpanded] = React.useState(props.expanded);

  React.useEffect(() => {
    setLocalExpanded(props.expanded);
  }, [props.expanded]);

  const renderCabecera = params => {
    const { row } = params;
    const { recogidatienda, codalmacen, codtiendarecogida } = row;

    return (
      <>
        <div className="cabeceraPedidoWebWrapper">
          <div className="cabeceraPedidoWeb">
            <div className="cabeceraCodComanda">{row.codcomanda}</div>
            <div className="cabeceraTotalLineas">Total líneas: {row.totalLineas}</div>
          </div>
        </div>
        {recogidatienda && codtiendarecogida === codalmacen ? (
          <div className="labelRecogida-Wrapper">
            <div className="labelRecogida">Recogida En Tienda</div>
          </div>
        ) : null}
      </>
    );
  };

  const renderLinea = params => {
    const { row } = params;

    return (
      <div className="lineaArticulo">
        <div className="descripcion">{row.descripcion}</div>
        <div>
          {row.referencia}
          {row.talla !== "TU" ? `- ${row.talla}` : null}
        </div>
        <div>{row.barcode}</div>
      </div>
    );
  };

  const barCodeKeyUp = (event, row, successBeep, errorBeep) => {
    const { lineas } = row;
    if (event.key === "Enter" && event.target.value !== "") {
      setMsgBarcodeClass("");
      setMsgBarcode("");
      const barCodeEscaneado = event.target.value;
      const lk = lineas.find(
        linea => linea.barcode === barCodeEscaneado && !linea.barcodeescaneado,
      );
      if (lk) {
        lk.barcodeescaneado = true;
        lk.pedidopreparado = true;
        dispatch({
          type: "onBarcodeScan",
          payload: {
            id: lk.id,
            barcodeescaneado: true,
          },
        });
        setMsgBarcodeClass("msgBarcode-Success");
        // setMsgBarcode("el barcode se escaneo correctamente");
        setMsgBarcode(`${barCodeEscaneado} escaneado correctamente`);
        successBeep();
      } else {
        setMsgBarcodeClass("msgBarcode-Error");
        const lkError = lineas.find(linea => linea.barcode === barCodeEscaneado);
        if (lkError) {
          setMsgBarcode(`${barCodeEscaneado} ya ha sido escaneado.`);
        } else {
          setMsgBarcode(`${barCodeEscaneado} no se corresponde con ningún artículo.`);
        }
        errorBeep();
      }
      document.getElementById(event.target.id).value = "";
      () => setScannerValue("");
    }
  };

  const modificarPackaging = (barcode, value) => {
    rowPackaging[barcode] = value;
    setRowPackaging(rowPackaging);
  };

  const renderLineas = params => {
    const [successBeep] = useSound(successSound);
    const [errorBeep] = useSound(errorSound);
    const {
      row,
      row: {
        lineas,
        lineasFiltradas,
        totalFaltantes,
        totalImpreso,
        totalLineas,
        totalPreparado,
        totalEtiquetaAsignada,
        etiquetaUrl,
        codcomanda,
        codalmacen,
        recogidatienda,
        codtiendarecogida,
        packaging,
      },
    } = params;

    if (packaging) {
      const paquete = {};
      Object.keys(JSON.parse(packaging)).forEach(key => {
        paquete[JSON.parse(packaging)[key]] = 0;
      });
      if (!rowPackaging) {
        setRowPackaging(paquete);
      }
    }

    let recogidaTienda = false;
    if (recogidatienda && codalmacen === codtiendarecogida) {
      recogidaTienda = true;
    }

    let activeMarcarEnviado = false;
    if (totalLineas === parseInt(totalFaltantes, 10) + parseInt(totalImpreso, 10)) {
      activeMarcarEnviado = true;
    }

    let activeTransportista = false;
    if (
      totalLineas === parseInt(totalFaltantes, 10) + parseInt(totalPreparado, 10) &&
      ((!recogidaTienda && !etiquetaUrl) || (recogidaTienda && !activeMarcarEnviado))
    ) {
      activeTransportista = true;
    }

    let activeEtiquetaAsignada = false;
    if (totalLineas === parseInt(totalFaltantes, 10) + parseInt(totalEtiquetaAsignada, 10)) {
      activeEtiquetaAsignada = true;
    }

    let activeMarcarFaltante = false;
    if (rowFaltanteSelectionModel && rowFaltanteSelectionModel.length > 0) {
      activeMarcarFaltante = true;
    }

    const columns = [
      {
        field: "id",
        headerName: "ARTÍCULOS",
        sortable: false,
        flex: 0.9,
        resizable: false,
        // width: "370",
        renderCell: params => renderLinea(params),
      },
    ];

    let lineasMostrar = lineas;
    if (lineasFiltradas) {
      lineasMostrar = lineasFiltradas;
    }

    const { setFiltroSeleccionado } = props;

    return (
      <div className="bodyPedidoWeb">
        <div className="datosPedidoWeb-Wrapper">
          <div className="datosPedidoWeb">{row.cliente}</div>
          <div className="datosPedidoWeb">{row.direccion}</div>
          <div className="datosPedidoWeb">
            {row.mg_ciudadenv} {row.mg_provinciaenv} {row.mg_codpostalenv} {row.mg_paisenv}
          </div>
          <div className="datosPedidoWeb">
            {row.fecha} {row.hora}
          </div>
        </div>
        <div className="pedidosWebAcciones">
          <IconButton
            id={`button-transportista-label-${row.codcomanda}`}
            className={
              activeTransportista
                ? "transportistaLabelPedidoWeb-Active"
                : "transportistaLabelPedidoWeb"
            }
            onClick={() => {
              if (activeTransportista) {
                if (recogidaTienda) {
                  dispatch({
                    type: "onMarcarImpreso",
                    payload: {
                      codcomanda,
                    },
                  });
                  if (packaging) {
                    setAbrirDialogoPackaging(true);
                  }
                } else {
                  if (parseInt(totalPreparado, 10) === 0) {
                    alert("No existen lineas preparadas");
                  }
                  if (parseInt(totalPreparado, 10) === 1) {
                    if (packaging) {
                      setAbrirDialogoPackaging(true);
                    } else {
                      dispatch({
                        type: "dameEtiquetaEnvio",
                        payload: {
                          codalmacen,
                          codcomanda,
                          numBultos: 1,
                          packaging: null,
                        },
                      });
                    }
                  }
                  if (parseInt(totalPreparado, 10) > 1) {
                    setAbrirDialogoNumBultos(true);
                  }
                }
              }
            }}
            aria-label="Avisar Transportista"
            title="Avisar Transportista"
          >
            <Icon>local_shipping</Icon>
          </IconButton>
          <IconButton
            id={`button-print-label-${row.codcomanda}`}
            className={
              activeEtiquetaAsignada ? "printLabelPedidoWeb-Active" : "printLabelPedidoWeb"
            }
            onClick={() => {
              if (activeEtiquetaAsignada) {
                dispatch({
                  type: "onMarcarImpreso",
                  payload: {
                    codcomanda,
                  },
                });
                window.open(`${etiquetaUrl}`, "_blank");
              }
            }}
            aria-label="Imprimir Etiqueta"
            title="Imprimir Etiqueta"
          >
            <Icon>print</Icon>
          </IconButton>

          <IconButton
            id={`button-enviado-label-${row.codcomanda}`}
            className={
              activeMarcarEnviado ? "marcarEnviadoPedidoWeb-Active" : "marcarEnviadoPedidoWeb"
            }
            onClick={() => {
              if (activeMarcarEnviado) {
                dispatch({
                  type: "onMarcarComoEnviado",
                  payload: {
                    codcomanda,
                  },
                });
              }
            }}
            aria-label="Marcar como enviado"
            title="Marcar como enviado"
          >
            <Icon>check</Icon>
          </IconButton>

          <IconButton
            id={`button-print-label-${row.codcomanda}`}
            className={
              activeMarcarFaltante ? "marcarFaltantePedidoWeb-Active" : "marcarFaltantePedidoWeb"
            }
            onClick={() => {
              if (activeMarcarFaltante) {
                let posibleFaltante = true;

                rowFaltanteSelectionModel.forEach(idLinea => {
                  const lineaFaltante = lineas.find(linea => linea.id === Number(idLinea));
                  if (lineaFaltante.pedidopreparado) {
                    posibleFaltante = false;
                  }
                });
                if (posibleFaltante) {
                  dispatch({
                    type: "dialogoFaltante",
                    payload: {
                      idFaltantes: rowFaltanteSelectionModel,
                    },
                  });
                } else {
                  setAbrirDialogoFaltanteAviso(true);
                }
              }
            }}
            aria-label="Marcar como faltante"
            title="Marcar como faltante"
          >
            <Icon>send</Icon>
          </IconButton>
        </div>
        <div className="barcode-Wrapper">
          <input
            type="text"
            id={`Barcode-${row.codcomanda}`}
            className="inputBarcodeScanner"
            value={scannerValue}
            onKeyUp={event => barCodeKeyUp(event, row, successBeep, errorBeep)}
            name={`Barcode-${row.codcomanda}`}
            placeholder="Escanear Código de Barras"
          ></input>
          <div className={`msgBarcode ${msgBarcodeClass}`}>{msgBarcode}</div>
        </div>
        {lineasMostrar.length > 0 ? (
          <DataGrid
            rows={lineasMostrar}
            disableAutosize
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableColumnMenu
            disableRowSelectionOnClick
            checkboxSelection={true}
            hideFooter={true}
            onRowSelectionModelChange={(newRowFaltanteSelectionModel, details) => {
              if (newRowFaltanteSelectionModel && typeof newRowFaltanteSelectionModel === 'object' && 'ids' in newRowFaltanteSelectionModel) {
                if (newRowFaltanteSelectionModel.type == 'include') {
                  const selectedProjectIds = Array.from(newRowFaltanteSelectionModel.ids || []).map(id => String(id));
                  setFaltanteSelectionModel(selectedProjectIds);
                }

                // Si hacemos click en 'Select All' y es de tipo exclude marcamos todos las lineas de la tabla
                if (newRowFaltanteSelectionModel.type == 'exclude') {
                  const idsLineas = Array.from(lineasMostrar || []).map(linea => String(linea.id));
                  setFaltanteSelectionModel(idsLineas);
                }
              } else {
                setFaltanteSelectionModel([]);
              }
            }}
            columns={columns}
            slots={{ toolbar: null }}
            getRowId={row => row.id}
            getRowClassName={params => {
              if (params.row.faltantecreada) {
                return "rowFaltante";
              }
              if (params.row.pedidoenviado) {
                return "rowEnviado";
              }
              if (params.row.etiquetaimpresa) {
                return "rowEtiquetaImpresa";
              }
              if (params.row.pedidopreparado) {
                return "rowPedidoPreparado";
              }
              if (
                params.row.recogidatienda &&
                params.row.codtiendarecogida === params.row.codalmacen
              ) {
                return "rowRecogidaEnTienda";
              }

              return "rowLinea";
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
            localeText={{
              noRowsLabel: "No hay artículos",
              toolbarQuickFilterPlaceholder: "Buscar...",
              paginationRowsPerPage: "Líneas por página",
              paginationDisplayedRows: ({ from, to, count }) =>
                `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
              footerRowSelected: (count) =>
                count !== 1
                  ? `${count} filas seleccionadas`
                  : `${count} fila seleccionada`,
            }}
          />
        ) : (
          <div className="filterNoResult">
            <div className="filterNoResult-Text">No existen artículos con el filtro actual.</div>
            <Button
              id={`Button-${row.id}`}
              className="buttonLimpiarFiltros"
              text="Limpiar Filtros"
              variant="outlined"
              onClick={() => {
                setFiltroSeleccionado();
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const { pedido, expanded } = props;
  const {
    row: {
      totalPreparado,
      codcomanda,
      codalmacen,
      recogidatienda,
      codtiendarecogida,
      lineas,
      lineasFiltradas,
      packaging,
    },
  } = pedido;
  const lineasMod = lineasFiltradas ? lineasFiltradas : lineas;

  let backCabecera = "cabeceraAccordion-None";
  if (recogidatienda && codalmacen === codtiendarecogida) {
    backCabecera = "cabeceraAccordion-Recogida";
  }

  let pedidoPreparado = true;
  let pedidoEtiquetaImpresa = true;
  lineasMod.forEach(linea => {
    if (!linea.pedidopreparado) {
      pedidoPreparado = false;
    }

    if (!linea.etiquetaimpresa) {
      pedidoEtiquetaImpresa = false;
    }
  });

  if (pedidoPreparado) {
    backCabecera = "cabeceraAccordion-Escaneado";
  }

  if (pedidoEtiquetaImpresa) {
    backCabecera = "cabeceraAccordion-PteEnvio";
  }

  return (
    <div className="pedidoWebWrapper">
      <Accordion
        expanded={localExpanded}
        onChange={(e, isExpanded) => {
          setLocalExpanded(isExpanded);
        }}
      >
        <AccordionSummary
          expandIcon={<Icon>arrow_drop_down</Icon>}
          aria-controls="panel1-content"
          id="panel1-header"
          className={`cabeceraAccordion ${backCabecera}`}
        >
          {renderCabecera(pedido)}
        </AccordionSummary>
        <AccordionDetails>{renderLineas(pedido)}</AccordionDetails>
      </Accordion>

      <Container>
        <Dialog open={abrirDialogoFaltanteAviso} fullWidth maxWidth="md">
          <DialogTitle id="form-faltante-title">
            No se pueden marcar las lineas seleccionadas como faltantes. Existen líneas ya
            escaneadas
          </DialogTitle>
          <DialogActions className="pedidosWebDialogAction">
            <div>
              <Button
                id="aceptarAvisoFaltante"
                text="Aceptar"
                className="modalButton"
                onClick={() => setAbrirDialogoFaltanteAviso(false)}
              />
            </div>
          </DialogActions>
        </Dialog>
      </Container>

      <Container>
        <Dialog open={abrirDialogoNumBultos} fullWidth maxWidth="md">
          <DialogTitle id="form-numbultos-title">Numero de bultos:</DialogTitle>
          <div>
            <NumeroBultos
              numBultosDefecto={rowNumBultos}
              minBultos={1}
              maxBultos={totalPreparado}
              modificarBultos={setRowNumBultos}
            />
          </div>
          <DialogActions className="pedidosWebDialogAction">
            <Button
              id="cerrarNumBultos"
              text="Cerrar"
              className="modalButton"
              onClick={() => {
                setAbrirDialogoNumBultos(false);
              }}
            />
            <Button
              id="aceptarNumBultos"
              text="Aceptar"
              className="modalButton"
              onClick={() => {
                if (rowPackaging) {
                  setAbrirDialogoNumBultos(false);
                  setAbrirDialogoPackaging(true);
                } else {
                  dispatch({
                    type: "dameEtiquetaEnvio",
                    payload: {
                      codalmacen,
                      codcomanda,
                      numBultos: rowNumBultos,
                    },
                  });

                  setAbrirDialogoNumBultos(false);
                }
              }}
            />
          </DialogActions>
        </Dialog>
      </Container>

      {/* DIALOGO PACKAGING */}
      {rowPackaging ? (
        <Container>
          <Dialog open={abrirDialogoPackaging} fullWidth maxWidth="md">
            <DialogTitle id="form-packaging-title">Packaging:</DialogTitle>
            <div className="packagingWrapper">
              {Object.keys(JSON.parse(packaging)).map(key => (
                <div className="packagingArticle">
                  <div className="packagingTitle">{key}</div>
                  <NumeroBultos
                    numBultosDefecto={rowPackaging[JSON.parse(packaging)[key]]}
                    minBultos={0}
                    maxBultos={totalPreparado}
                    modificarBultos={modificarPackaging}
                    barcode={JSON.parse(packaging)[key]}
                  />
                </div>
              ))}
            </div>
            <DialogActions className="pedidosWebDialogAction">
              <Button
                id="cerrarNumBultos"
                text="Cerrar"
                className="modalButton"
                onClick={() => {
                  setAbrirDialogoPackaging(false);
                  dispatch({
                    type: "dameEtiquetaEnvio",
                    payload: {
                      codalmacen,
                      codcomanda,
                      numBultos: rowNumBultos,
                      packaging: null,
                    },
                  });
                }}
              />
              <Button
                id="aceptarNumBultos"
                text="Aceptar"
                className="modalButton"
                onClick={() => {
                  dispatch({
                    type: "dameEtiquetaEnvio",
                    payload: {
                      codalmacen,
                      codcomanda,
                      numBultos: rowNumBultos,
                      packaging: JSON.stringify(rowPackaging),
                    },
                  });

                  setAbrirDialogoPackaging(false);
                }}
              />
            </DialogActions>
          </Dialog>
        </Container>
      ) : null}
    </div>
  );
}

PedidoWeb.propTypes = {
  estilos: PropTypes.object,
};
PedidoWeb.defaultProps = {};

export default PedidoWeb;
