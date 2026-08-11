import "./ConsultaStock.style.scss";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Icon, IconButton } from "@quimera/comps";
import Quimera, { PropValidation, useStateValue } from "quimera";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import useSound from "use-sound";

import errorSound from "../../../../../apps/elganso-stores/assets/sound/error.mp3";
import successSound from "../../../../../apps/elganso-stores/assets/sound/success.mp3";
import { BarcodeScanner, LoadingGif } from "../../comps";

function ConsultaStock({ useStyles }) {
  const [state, dispatch] = useStateValue();
  // const _c = useStyles()
  const inputRef = useRef(null);
  const [showReaderBarcode, setShowReaderBarcode] = useState(false);
  const { msgSuccess, msgError, tiendasStock, showLoading, tallas } = state;
  const [scannerValue, setScannerValue] = React.useState();
  const [tallaSeleccionadaFiltro, setTallaSeleccionadaFiltro] = React.useState(null);
  const [filaSeleccionada, setFilaSeleccionada] = React.useState(null);
  const [respuestaTallas, setRespuestaTallas] = React.useState(false);

  useEffect(() => {
    dispatch({
      type: "init",
    });
  }, [dispatch, tiendasStock, msgSuccess]);

  const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);

      return objectsByKeyValue;
    }, {});

  const groupCodalmacen = groupBy("codalmacen");

  const tiendasAgrupadasPorAlmacen = () => {
    let listaTiendasClone = [...tiendasStock];
    //Si tiene filtro filtrar
    if (tallaSeleccionadaFiltro && tallaSeleccionadaFiltro !== "-") {
      listaTiendasClone = listaTiendasClone.filter(
        tienda => tienda.talla === tallaSeleccionadaFiltro,
      );
    }
    //Agrupar
    listaTiendasClone = groupCodalmacen(listaTiendasClone);
    //Calcular disponibilidad
    const arrayTiendasClone = Object.values(listaTiendasClone);
    const arrayTiendasFinal = [];
    for (let i = 0; i < arrayTiendasClone.length; i++) {
      const disponibilidadAux = [];
      let tiendaAux = {};
      for (let j = 0; j < arrayTiendasClone[i].length; j++) {
        const disponibilidad = {};
        if (j === 0) {
          tiendaAux = arrayTiendasClone[i][j];
        }
        disponibilidad[arrayTiendasClone[i][j]["talla"]] = arrayTiendasClone[i][j]["disponible"];
        disponibilidadAux.push(disponibilidad);
      }
      tiendaAux["disponibilidad"] = disponibilidadAux;
      arrayTiendasFinal.push(tiendaAux);
    }

    return arrayTiendasFinal;
  };

  const barCodeScannerCam = event => {
    if (event) {
      dispatch({
        type: "getTallasByReferenciaOrBarcode",
        payload: {
          barcodeInput: event,
        },
      });
      setFilaSeleccionada(null);
      setTallaSeleccionadaFiltro(null);
      setRespuestaTallas(true);
    }
  };

  const renderBarcode = () => {
    return <BarcodeScanner parentDispatch={barCodeScannerCam} focus={inputRef.current} />;
  };
  const renderTienda = params => {
    return (
      <Accordion
        className="Accordion-Tienda"
        expanded={filaSeleccionada === params.id}
        onChange={(e, isExpanded) => {
          e.stopPropagation();
          setFilaSeleccionada(isExpanded ? params.id : null);
        }}
      >
        <AccordionSummary
          expandIcon={<Icon>arrow_drop_down</Icon>}
          aria-controls="panel1-content"
          id="panel1-header"
          className="cabeceraAccordion"
          onClick={e => e.stopPropagation()}
        >
          <span>
            <b>{params.row.tienda.titulo}</b>
          </span>
        </AccordionSummary>
        <AccordionDetails className="bodyAccordion">
          <div>{params.row.tienda.linea_1}</div>
          <div>{params.row.tienda.linea_2}</div>
          <div>{params.row.tienda.linea_3}</div>
          {/* <div>{params.row.tienda.distancia}</div> */}
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderDisponibilidad = params => {
    const disponibilidad = params.row.tienda.disponibilidad;

    const rows = [];
    disponibilidad.forEach(element => {
      for (const key in element) {
        rows.push(
          <div>
            <strong>{key}</strong>: {element[key]}
          </div>,
        );
      }
    });

    return <div className="disponibilidadStockContainer">{rows}</div>;
  };

  const columns = [
    {
      field: "tienda",
      headerName: "TIENDA",
      renderCell: params => renderTienda(params),
      flex: 6,
    },
    {
      field: "talla",
      headerName: "STOCK",
      headerAlign: "center",
      align: "center",
      renderCell: params => renderDisponibilidad(params),
      flex: 3,
    },
  ];

  function procesarTienda(tienda) {
    const tiendasProcesada = [];
    tiendasProcesada["titulo"] = `${tienda["descripcion"]} - ${tienda["codalmacen"]}`;
    tiendasProcesada["linea_1"] = `${tienda["direccion"]}`;
    tiendasProcesada[
      "linea_2"
    ] = `${tienda["ciudad"]} (${tienda["provincia"]}) ${tienda["codpostal"]} ${tienda["codpais"]}`;
    tiendasProcesada["linea_3"] = `${tienda["telefono"]}`;
    tiendasProcesada["talla"] = `${tienda["talla"]}`;
    tiendasProcesada["disponibilidad"] = tienda["disponibilidad"];
    tiendasProcesada["distancia"] = tienda["distancia"];

    return tiendasProcesada;
  }

  const renderLoading = () => {
    if (showLoading) {
      return (
        <div className="loading-wrapper">
          <LoadingGif />
        </div>
      );
    }

    return null;
  };

  const renderTablaTiendas = () => {
    const tiendasProcesados = [];

    for (let i = 0; i < tiendasAgrupadasPorAlmacen().length; i++) {
      const tiendaProcesado = [];
      tiendaProcesado["index"] = i;
      tiendaProcesado["tienda"] = procesarTienda(tiendasAgrupadasPorAlmacen()[i]);
      tiendasProcesados.push(tiendaProcesado);
    }
    if (tiendasProcesados.length === 0) {
      return <div className="msg-error">No hay stock disponible para la talla seleccionada.</div>;
    }

    return (
      <DataGrid
        rows={tiendasProcesados}
        disableAutosize
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableColumnMenu
        columns={columns}
        getRowId={row => row.index}
        getRowClassName={() => "rowTienda"}
        getRowHeight={() => "auto"}
        sx={{
          ".MuiDataGrid-virtualScroller::-webkit-scrollbar": { display: "none" },
        }}
        localeText={{
          noRowsLabel: "No hay stock disponible para la talla seleccionada.",
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
    );
  };

  const handleChangeFiltro = e => {
    if (e.value) {
      setTallaSeleccionadaFiltro(e.value);
    }
  };

  const renderListaTiendas = () => {
    if (tallas.length === 1) {
      return renderTablaTiendas();
    }
    const tallasFiltro = [];

    tallasFiltro.push({ label: "TODAS LAS TALLAS", value: "-" });
    tallas.map(element => tallasFiltro.push({ label: element, value: element }));

    return (
      <>
        <div className="row-select-talla">
          <Select
            options={tallasFiltro}
            placeholder="Filtrar por talla"
            onChange={handleChangeFiltro}
          />
        </div>
        {tallaSeleccionadaFiltro ? renderTablaTiendas() : null}
      </>
    );
  };

  const barCodeKeyUp = event => {
    if (event.key === "Enter" && event.target.value !== "") {
      dispatch({
        type: "getTallasByReferenciaOrBarcode",
        payload: {
          barcodeInput: event.target.value,
        },
      });
      document.getElementById(event.target.id).value = "";
      () => setScannerValue("");
      setFilaSeleccionada(null);
      setTallaSeleccionadaFiltro(null);
      setRespuestaTallas(true);
    }
  };

  const renderMsgSuccess = (msgSuccess, msgError, successBeep) => {
    if (msgError === "" && msgSuccess !== "" && respuestaTallas) {
      successBeep();
      setRespuestaTallas(false);
    }

    return <div className="msg-success">{msgSuccess}</div>;
  };

  const renderMsgError = (msgError, errorBeep) => {
    if (respuestaTallas) {
      errorBeep();
      setRespuestaTallas(false);
    }

    return <div className="msg-error">{msgError}</div>;
  };

  const render = () => {
    const [successBeep] = useSound(successSound);
    const [errorBeep] = useSound(errorSound);

    return (
      <div id="consultaStock">
        <div className="main-edit">
          <div className="main-edit-container">
            <Box width={1} className="box-consulta-stock">
              <div className={"header-consulta-stock" + (showReaderBarcode ? " opened" : "")}>
                <div className="block-search">
                  <div className="rowVerTodos">
                    <input
                      type="text"
                      id="inputBarcode"
                      className="inputBarcodeScanner"
                      value={scannerValue}
                      onKeyUp={event => barCodeKeyUp(event)}
                      name="inputBarcode"
                      placeholder="Introduce referencia o escanea"
                    ></input>
                    <IconButton
                      id="button-reader-barcode"
                      className="buttonReaderBarcode"
                      onClick={() => {
                        setShowReaderBarcode(!showReaderBarcode);
                        inputRef.current.focus();
                      }}
                    >
                      <Icon>qr_code_scanner_icon</Icon>
                    </IconButton>
                  </div>
                  {msgSuccess !== "" ? renderMsgSuccess(msgSuccess, msgError, successBeep) : null}
                  {msgError !== "" ? renderMsgError(msgError, errorBeep) : null}
                </div>
                {showReaderBarcode ? renderBarcode() : null}
              </div>
              {tiendasStock.length > 0 ? renderListaTiendas() : renderLoading()}
            </Box>
          </div>
        </div>
      </div>
    );
  };

  return <Quimera.Template id="ConsultaStock">{render()}</Quimera.Template>;
}

ConsultaStock.propTypes = PropValidation.propTypes;
ConsultaStock.defaultProps = PropValidation.defaultProps;
export default ConsultaStock;
