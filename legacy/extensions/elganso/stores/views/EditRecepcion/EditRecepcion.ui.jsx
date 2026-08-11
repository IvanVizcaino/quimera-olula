import "./EditRecepcion.style.scss";

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

function EditRecepcion({ ...props }) {
  const [state, dispatch] = useStateValue();
  const { idRecepcion } = props;
  const { lineasRecepcion, mostrarTodos, msgSuccess, msgError } = state;
  const [recepcionesDbIndex, setRecepcionesDbIndex] = useDbState(
    "recepcionesDbIndex",
    "",
    "ElGansoApp3",
    "Recepciones",
  );
  const [lineasModificadas, setlineasModificadas] = useState({});
  const [showReaderBarcode, setShowReaderBarcode] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    getDbValue("ElGansoApp3", "Recepciones", "recepcionesDbIndex").then(recepcionesIndexadas => {
      const recepcionSeleccionada = recepcionesIndexadas.find(
        recepcion => recepcion.idviajemultitrans === idRecepcion,
      );
      dispatch({
        type: "init",
        payload: {
          idviajemultitransFiltro: idRecepcion,
          recepcionesIndexadas,
          setRecepcionesDbIndex,
          recepcionSeleccionada,
        },
      });
    });
  }, [dispatch]);

  const actualizarLineasModificadas = params => {
    lineasModificadas[params.idlinea] = params;
    setlineasModificadas(lineasModificadas);

    if (recepcionesDbIndex && recepcionesDbIndex.length > 0) {
      const result = recepcionesDbIndex.find(params => params.idviajemultitrans === idRecepcion);
      if (result) {
        result.lineasModificadas = { ...result.lineasModificadas, ...lineasModificadas };
      }
    }
    setRecepcionesDbIndex(recepcionesDbIndex);
  };

  const barCodeKeyUp = event => {
    if (event.key === "Enter" && event.target.value !== "") {
      let result = lineasRecepcion.find(item => item.barcode === event.target.value);
      if (recepcionesDbIndex && recepcionesDbIndex.length > 0) {
        const resultado = recepcionesDbIndex.find(
          recepcion => recepcion.idviajemultitrans === result.idviajemultitrans,
        );
        if (resultado.lineasModificadas && resultado.lineasModificadas[result.idlinea]) {
          result = resultado.lineasModificadas[result.idlinea];
        }
      }

      if (result && !result.cerradorx) {
        result.modificado = true;
        // result.cantpterecibir--;
        result.cantrecibida++;
        if (result.cantpterecibir === result.cantrecibida) {
          result.cerradorx = true;
        }

        dispatch({
          type: "updateLinea",
          payload: {
            lineasRecepcion,
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
          error = `El barcode ${event.target.value} no está incluido en esta recepción`;
        } else if (result.cerradorx) {
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

  // NO SUBE LA CANTIDAD DE LA LINEA
  const barCodeScannerCam = event => {
    if (event) {
      let result = lineasRecepcion.find(item => item.barcode === event);
      if (result && recepcionesDbIndex && recepcionesDbIndex.length > 0) {
        const resultado = recepcionesDbIndex.find(
          recepcion => recepcion.idviajemultitrans === result.idviajemultitrans,
        );
        if (resultado.lineasModificadas && resultado.lineasModificadas[result.idlinea]) {
          result = resultado.lineasModificadas[result.idlinea];
        }
      }

      if (result && !result.cerradorx) {
        result.modificado = true;
        // result.cantpterecibir--;
        result.cantrecibida++;
        if (result.cantpterecibir === result.cantrecibida) {
          result.cerradorx = true;
        }

        dispatch({
          type: "updateLinea",
          payload: {
            lineasRecepcion,
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
          error = `El barcode ${event} no está incluido en esta recepción`;
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
    let result = lineasRecepcion.find(item => item.idlinea === params.idlinea);
    if (recepcionesDbIndex && recepcionesDbIndex.length > 0) {
      const resultado = recepcionesDbIndex.find(
        recepcion => recepcion.idviajemultitrans === result.idviajemultitrans,
      );
      if (resultado.lineasModificadas && resultado.lineasModificadas[result.idlinea]) {
        result = resultado.lineasModificadas[result.idlinea];
      }
    }
    result.cerradorx = !result.cerradorx;
    result.modificado = true;

    dispatch({
      type: "blockLinea",
      payload: {
        lineasRecepcion,
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
        <span>{params.row.cantrecibida} /</span>
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
        {params.row.cerradorx ? <Icon>lock</Icon> : <Icon>lock_open</Icon>}
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
      if (lineasRecepcion.length > 0) {
        almacenDestino = lineasRecepcion[0].codalmadestino;
      }

      return (
        <div className="backLink">
          <IconButton
            id="button-back"
            className="backLink"
            onClick={() => navigate(`/recepciones`)}
          >
            <Icon className="backLinkButton">arrow_back</Icon>
          </IconButton>
          {`Recepción ${props.idRecepcion} desde ${almacenDestino}`}
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
    let rowLineasRecepcion = lineasRecepcion;
    if (recepcionesDbIndex && recepcionesDbIndex.length > 0) {
      const recepcionSeleccionado = recepcionesDbIndex.find(
        params => params.idviajemultitrans === idRecepcion,
      );
      if (recepcionSeleccionado && recepcionSeleccionado.lineasModificadas) {
        const lineasRecepcionAux = [];
        for (let i = 0; i < rowLineasRecepcion.length; i++) {
          if (recepcionSeleccionado.lineasModificadas[lineasRecepcion[i].idlinea]) {
            lineasRecepcionAux.push(
              recepcionSeleccionado.lineasModificadas[lineasRecepcion[i].idlinea],
            );
          } else {
            lineasRecepcionAux.push(lineasRecepcion[i]);
          }
        }
        rowLineasRecepcion = lineasRecepcionAux;
      }
    }

    // Calculo del total de articulos enviados
    const lineasTotalProcesados = rowLineasRecepcion.map(linea => linea.cantrecibida);
    const totalProcesados = lineasTotalProcesados.reduce((partialSum, a) => partialSum + a, 0);
    // FIN Calculo del total de articulos enviados

    if (!mostrarTodos) {
      rowLineasRecepcion = (rowLineasRecepcion || []).filter(row => row.cerradorx !== true);
    }

    const sumCantidad = rowLineasRecepcion.reduce(function (prev, current) {
      return prev + +current.cantidad;
    }, 0);
    const sumCantidadRecibida = rowLineasRecepcion.reduce(function (prev, current) {
      return prev + +current.cantrecibida;
    }, 0);

    let progress = 0;
    if (sumCantidadRecibida > sumCantidad) {
      progress = 100;
    } else {
      progress = (sumCantidadRecibida / sumCantidad) * 100;
    }

    return (
      <div id="EditRecepcion">
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
            rows={rowLineasRecepcion}
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
                params.row.cantrecibida < params.row.cantpterecibir &&
                params.row.cantrecibida > 0 &&
                params.row.cerradorx !== true
              ) {
                classColor = "byellow";
              } else if (
                params.row.cantpterecibir === params.row.cantrecibida ||
                params.row.cerradorx === true
              ) {
                classColor = "bgreen";
              } else if (params.row.cantrecibida > params.row.cantpterecibir) {
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

  return <Quimera.Template id="EditRecepcion">{render()}</Quimera.Template>;
}

EditRecepcion.propTypes = PropValidation.propTypes;
EditRecepcion.defaultProps = PropValidation.defaultProps;
export default EditRecepcion;
