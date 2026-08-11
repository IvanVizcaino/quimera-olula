import "./EditEnvio.style.scss";

import { LinearProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Field, Icon, IconButton } from "@quimera/comps";
import { Checkbox } from "@quimera/thirdparty";
import { navigate } from "hookrouter";
import Quimera, { PropValidation, useStateValue } from "quimera";
import { useEffect, useRef, useState } from "react";
import { useDbState } from "use-db-state";

import { BarcodeScanner } from "../../comps";

const getDbInstance = (dbName, storeName) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
};

const getDbValue = async (dbName, storeName, key) => {
  const db = await getDbInstance(dbName, storeName);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(key);

    request.onsuccess = event => {
      resolve(event.target.result ? event.target.result.value : undefined);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
};

function EditEnvio({ ...props }) {
  const [state, dispatch] = useStateValue();
  const { idEnvio } = props;
  const { lineasEnvios, mostrarTodos, msgSuccess, msgError } = state;
  const [enviosDbIndex, setEnviosDbIndex] = useDbState(
    "enviosDbIndex",
    "",
    "ElGansoApp2",
    "Envios",
  );
  const [lineasModificadas, setlineasModificadas] = useState({});
  const [showReaderBarcode, setShowReaderBarcode] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getDbValue("ElGansoApp2", "Envios", "enviosDbIndex").then(enviosIndexados => {
      const envioSeleccionado = enviosIndexados.find(envio => envio.idviajemultitrans === idEnvio);
      dispatch({
        type: "init",
        payload: {
          idviajemultitransFiltro: idEnvio,
          enviosIndexados,
          setEnviosDbIndex,
          envioSeleccionado,
        },
      });
    });
  }, [dispatch]);

  const actualizarLineasModificadas = params => {
    lineasModificadas[params.idlinea] = params;
    setlineasModificadas(lineasModificadas);

    if (enviosDbIndex && enviosDbIndex.length > 0) {
      const result = enviosDbIndex.find(params => params.idviajemultitrans === idEnvio);
      if (result) {
        result.lineasModificadas = { ...result.lineasModificadas, ...lineasModificadas };
      }
    }
    setEnviosDbIndex(enviosDbIndex);
  };

  const barCodeKeyUp = event => {
    if (event.key === "Enter" && event.target.value !== "") {
      let result = lineasEnvios.find(item => item.barcode === event.target.value);
      if (enviosDbIndex && enviosDbIndex.length > 0) {
        const resultado = enviosDbIndex.find(
          envio => envio.idviajemultitrans === result.idviajemultitrans,
        );
        if (resultado.lineasModificadas && resultado.lineasModificadas[result.idlinea]) {
          result = resultado.lineasModificadas[result.idlinea];
        }
      }

      if (result && !result.cerradoex) {
        result.modificado = true;
        // result.cantpteenvio--;
        result.cantenviada++;
        if (result.cantpteenvio === result.cantenviada) {
          result.cerradoex = true;
        }

        dispatch({
          type: "updateLinea",
          payload: {
            lineasEnvios,
          },
        });
        dispatch({
          type: "setMensajes",
          payload: {
            msgSuccess: `${result.referencia}-${result.talla} ${result.descripcion}`,
            msgError: "",
          },
        });
        actualizarLineasModificadas(result);
      } else {
        let error = "";
        if (!result) {
          error = `El barcode ${event.target.value} no está incluido en este envío`;
        } else if (result.cerradoex) {
          error = "La linea está cerrada.";
        } else {
          error = "Se ha producido un error.";
        }
        dispatch({
          type: "setMensajes",
          payload: {
            msgSuccess: "",
            msgError: error,
          },
        });
      }
    }
  };

  const barCodeScannerCam = event => {
    if (event) {
      let result = lineasEnvios.find(item => item.barcode === event);
      if (result && enviosDbIndex && enviosDbIndex.length > 0) {
        const resultado = enviosDbIndex.find(
          envio => envio.idviajemultitrans === result.idviajemultitrans,
        );
        if (resultado.lineasModificadas && resultado.lineasModificadas[result.idlinea]) {
          result = resultado.lineasModificadas[result.idlinea];
        }
      }

      if (result && !result.cerradoex) {
        result.modificado = true;
        // result.cantpteenvio--;
        result.cantenviada++;
        if (result.cantpteenvio === result.cantenviada) {
          result.cerradoex = true;
        }

        dispatch({
          type: "updateLinea",
          payload: {
            lineasEnvios,
          },
        });
        dispatch({
          type: "setMensajes",
          payload: {
            msgSuccess: `${result.referencia}-${result.talla} ${result.descripcion}`,
            msgError: "",
          },
        });
        actualizarLineasModificadas(result);
      } else {
        let error = "";
        if (!result) {
          error = `El barcode ${event} no está incluido en este envío`;
        } else if (result.cerradoex) {
          error = "La linea está cerrada.";
        } else {
          error = "Se ha producido un error.";
        }
        dispatch({
          type: "setMensajes",
          payload: {
            msgSuccess: "",
            msgError: error,
          },
        });
      }
    }
  };

  const renderBarcode = () => {
    return <BarcodeScanner parentDispatch={barCodeScannerCam} focus={inputRef.current} />;
  };

  const blockLinea = params => {
    let result = lineasEnvios.find(item => item.idlinea === params.idlinea);
    if (enviosDbIndex && enviosDbIndex.length > 0) {
      const resultado = enviosDbIndex.find(
        envio => envio.idviajemultitrans === result.idviajemultitrans,
      );
      if (resultado.lineasModificadas && resultado.lineasModificadas[result.idlinea]) {
        result = resultado.lineasModificadas[result.idlinea];
      }
    }
    result.cerradoex = !result.cerradoex;
    result.modificado = true;

    dispatch({
      type: "blockLinea",
      payload: {
        lineasEnvios,
      },
    });

    dispatch({
      type: "setMensajes",
      payload: {
        msgSuccess: `${result.referencia}-${result.talla} ${result.descripcion}`,
        msgError: "",
      },
    });
    actualizarLineasModificadas(result);
  };

  const renderArticulo = params => {
    return (
      <div className="articuloName">
        <span>
          {`${params.row.referencia}${params.row.talla ? `-${params.row.talla}` : ""} ${params.row.descripcion}`}
        </span>
      </div>
    );
  };
  const renderCantidades = params => {
    return (
      <div>
        <span>{params.row.cantenviada} /</span>
        <span className="cantidad"> {params.row.cantidad}</span>
      </div>
    );
  };
  const renderActions = params => {
    return (
      <IconButton
        id="button-block"
        className="buttonAcciones buttonAcciones-active"
        onClick={() => blockLinea(params.row)}
      >
        {params.row.cerradoex ? <Icon>lock</Icon> : <Icon>lock_open</Icon>}
      </IconButton>
    );
  };
  const verTodos = () => {
    dispatch({
      type: "mostrarTodos",
    });
  };
  const cleanMsg = () => {
    dispatch({
      type: "setMensajes",
      payload: {
        msgSuccess: "",
        msgError: "",
      },
    });
  };

  const render = () => {
    const renderBack = () => {
      let almacenDestino = "";
      if (lineasEnvios.length > 0) {
        almacenDestino = lineasEnvios[0].codalmadestino;
      }

      return (
        <div className="backLink">
          <IconButton id="button-back" className="backLink" onClick={() => navigate(`/envios`)}>
            <Icon className="backLinkButton">arrow_back</Icon>
          </IconButton>
          {`Envio ${props.idEnvio} hacia ${almacenDestino}`}
        </div>
      );
    };
    const columns = [
      {
        field: "referencia",
        headerName: "Artículo",
        sortable: false,
        flex: 2,
        renderCell: params => renderArticulo(params),
      },
      {
        field: "cantidades",
        headerName: "",
        sortable: false,
        flex: 0.5,
        renderCell: params => renderCantidades(params),
      },
      {
        field: "action",
        headerName: "",
        sortable: false,
        flex: 0.5,
        renderCell: params => renderActions(params),
      },
    ];
    let rowLineasEnvios = lineasEnvios;
    if (enviosDbIndex && enviosDbIndex.length > 0) {
      const envioSeleccionado = enviosDbIndex.find(params => params.idviajemultitrans === idEnvio);
      if (envioSeleccionado && envioSeleccionado.lineasModificadas) {
        const lineasEnvioAux = [];
        for (let i = 0; i < rowLineasEnvios.length; i++) {
          if (envioSeleccionado.lineasModificadas[lineasEnvios[i].idlinea]) {
            lineasEnvioAux.push(envioSeleccionado.lineasModificadas[lineasEnvios[i].idlinea]);
          } else {
            lineasEnvioAux.push(lineasEnvios[i]);
          }
        }
        rowLineasEnvios = lineasEnvioAux;
      }
    }
    // Calculo del total de articulos enviados
    const lineasTotalProcesados = rowLineasEnvios.map(linea => linea.cantenviada);
    const totalProcesados = lineasTotalProcesados.reduce((partialSum, a) => partialSum + a, 0);
    // FIN Calculo del total de articulos enviados
    if (!mostrarTodos) {
      rowLineasEnvios = (rowLineasEnvios || []).filter(row => row.cerradoex !== true);
    }

    // Para la barra de progreso
    const sumCantidad = rowLineasEnvios.reduce(function (prev, current) {
      return prev + +current.cantidad;
    }, 0);
    const sumCantidadEnviada = rowLineasEnvios.reduce(function (prev, current) {
      return prev + +current.cantenviada;
    }, 0);

    let progress = 0;
    if (sumCantidadEnviada > sumCantidad) {
      progress = 100;
    } else {
      progress = (sumCantidadEnviada / sumCantidad) * 100;
    }
    // FIN Para la barra de progreso

    return (
      <div id="EditEnvio">
        {renderBack()}
        <div className="main-edit">
          <div className="main-edit-container">
            {showReaderBarcode ? renderBarcode() : null}
            <Box width={1}>
              <div className="rowVerTodos">
                <Field.Text
                  id="barcode"
                  label="Barcode Reader"
                  autoFocus
                  onClick={(event => event.target.select(), cleanMsg)}
                  inputRef={inputRef}
                  onKeyUp={barCodeKeyUp}
                />
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
              {msgSuccess !== "" ? <div className="msg-success">{msgSuccess}</div> : ""}
              {msgError !== "" ? <div className="msg-error">{msgError}</div> : ""}
              <div className="rowVerTodos">
                Total: {totalProcesados}{" "}
                <Checkbox
                  id="checkMostrarTodos"
                  checked={mostrarTodos}
                  onClick={() => verTodos()}
                />{" "}
                Ver Todos
              </div>
            </Box>
          </div>
          <LinearProgress variant="determinate" value={progress} />
          <DataGrid
            rows={rowLineasEnvios}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableColumnMenu
            disableRowSelectionOnClick
            columns={columns}
            slots={{ toolbar: null }}
            getRowId={row => row.idlinea}
            getRowClassName={params => {
              let classColor = "";
              if (
                params.row.cantenviada < params.row.cantpteenvio &&
                params.row.cantenviada > 0 &&
                params.row.cerradoex !== true
              ) {
                classColor = "byellow";
              } else if (
                params.row.cantpteenvio === params.row.cantenviada ||
                params.row.cerradoex === true
              ) {
                classColor = "bgreen";
              } else if (params.row.cantenviada > params.row.cantpteenvio) {
                classColor = "bblue";
              }

              return classColor;
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
        </div>
      </div>
    );
  };

  return <Quimera.Template id="EditEnvio">{render()}</Quimera.Template>;
}

EditEnvio.propTypes = PropValidation.propTypes;
EditEnvio.defaultProps = PropValidation.defaultProps;
export default EditEnvio;
