import "./EditInventario.style.scss";

import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Field,
  Icon,
  IconButton,
} from "@quimera/comps";
import { navigate } from "hookrouter";
import Quimera, { PropValidation, useStateValue } from "quimera";
import { useEffect, useRef, useState } from "react";
import { useDbState } from "use-db-state";

import { BarcodeScanner } from "../../comps";

const getDbInstance = (dbName, storeName) => {
  return new Promise((resolve, reject) => {
    // const storageVersion = localStorage.getItem("indexDbVersion");
    // const version = storageVersion === null ? 1 : parseInt(storageVersion, 10) + 1;
    // localStorage.setItem("indexDbVersion", version);

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

function EditInventario({ ...props }) {
  const [state, dispatch] = useStateValue();
  const { idSincro } = props;
  const {
    barcode,
    lineasInventarios,
    qtyAgregar,
    qtyModificada,
    modalEditVisible,
    lineaSeleccionada,
    inventario,
    inventariosDbIndexState,
  } = state;

  const inputRef = useRef(null);
  const [showReaderBarcode, setShowReaderBarcode] = useState(false);
  const [lineasModificadas, setlineasModificadas] = useState({});
  const [inventariosDbIndex, setInventariosDbIndex] = useDbState(
    "inventariosDbIndex",
    "",
    "ElGansoAppInv",
    "Inventarios",
  );
  const [_, setArticulosDbIndex] = useDbState("articulosDbIndex", "", "ElGansoAppArt", "Articulos");

  useEffect(() => {
    dispatch({
      type: "init",
      payload: {
        idsincroFiltro: idSincro,
      },
    });

    // Guardar funcion actualizar datos en un state
    dispatch({
      type: "setIndexDb",
      payload: {
        inventariosDbIndex,
        setInventariosDbIndex,
      },
    });

    // Obtener inventarios
    getDbValue("ElGansoAppInv", "Inventarios", "inventariosDbIndex").then(inventariosIndexados => {
      dispatch({
        type: "getInventario",
        payload: {
          idsincroFiltro: idSincro,
          inventariosDbIndex: inventariosIndexados,
        },
      });
    });

    // Obtener articulos
    getDbValue("ElGansoAppArt", "Articulos", "articulosDbIndex").then(articulosIndexados => {
      setArticulosDbIndex(articulosIndexados);
      dispatch({
        type: "getArticulos",
        payload: {
          articulosDbIndex: articulosIndexados,
          setArticulosDbIndex,
        },
      });
    });
  }, [dispatch]);

  const actualizarLineasModificadas = params => {
    lineasModificadas[params.id] = params;
    setlineasModificadas(lineasModificadas);

    if (inventariosDbIndex && inventariosDbIndex.length > 0) {
      const result = inventariosDbIndex.find(
        params => params.idinventario === inventario.idinventario,
      );
      if (result) {
        result.lineasModificadas = { ...result.lineasModificadas, ...lineasModificadas };
      }
    }
    setInventariosDbIndex(inventariosDbIndex);
    dispatch({
      type: "setInvDbIndexState",
      payload: {
        setInvDbIndexState: inventariosDbIndex,
      },
    });
  };

  const render = () => {
    const renderBack = () => {
      let textName = "";

      if (inventario) {
        textName = `${inventario.idinventario} - ${inventario.descripcion} (${idSincro})`;
      } else {
        textName = `${idSincro}`;
      }

      return (
        <div className="backLink">
          <IconButton
            id="button-back"
            className="backLink"
            title="Volver a Inventarios"
            onClick={() => navigate(`/inventarios`)}
          >
            <Icon className="backLinkButton">arrow_back</Icon>
          </IconButton>
          {textName}
        </div>
      );
    };

    const saveLinea = (e, total = false, readedBarcode = null) => {
      let newBarcode = null;

      if (barcode === null || barcode === "") {
        if (readedBarcode !== null) {
          newBarcode = readedBarcode;
        }
      } else {
        newBarcode = barcode;
      }

      if (newBarcode !== null && newBarcode !== "") {
        let result = lineasInventarios.find(item => item.barcode === newBarcode);

        if (result && inventariosDbIndexState && inventariosDbIndexState.length > 0) {
          const resultado = inventariosDbIndexState.find(
            inv => inv.idsincro === result.egidsincroinv,
          );

          if (resultado.lineasModificadas && resultado.lineasModificadas[result.id]) {
            result = resultado.lineasModificadas[result.id];
          }
        }

        if (
          result === undefined &&
          inventario.lineasModificadas &&
          inventario.lineasModificadas.length > 0
        ) {
          result = inventario.lineasModificadas.find(item => item.barcode === newBarcode);
        }

        if (result !== undefined) {
          if (total) {
            result.cantidadfin = qtyModificada;
          } else {
            result.cantidadfin += qtyAgregar;
          }
          result.revisada = false;

          dispatch({
            type: "updateLineaIndexded",
            payload: {
              lineaModificada: result,
            },
          });

          actualizarLineasModificadas(result);

          dispatch({
            type: "setActualReadBarcode",
            payload: {
              value: null,
            },
          });
          inputRef.current.focus();
        } else {
          dispatch({
            type: "onClickAddNewLinea",
          });
        }
      }
    };

    const barCodeKeyUp = event => {
      if (event.key === "Enter" && event.target.value !== "") {
        saveLinea();
      }
    };

    const setBarcode = e => {
      dispatch({
        type: "setActualReadBarcode",
        payload: {
          value: e,
        },
      });

      saveLinea(null, false, e);
    };

    const renderBarcode = () => {
      return <BarcodeScanner parentDispatch={setBarcode} focus={inputRef.current} />;
    };

    const renderArticulo = params => {
      return (
        <div className="articuloName tableGrid">
          <span>
            {`${params.row.referencia}${params.row.talla ? `-${params.row.talla}` : ""} ${params.row.desarticulo}`}
          </span>
        </div>
      );
    };

    const renderCantidades = params => {
      return (
        <div>
          <span className="cantidad cantidadfin">{params.row.cantidadfin} /</span>
          <span className="cantidad"> {params.row.cantidadini}</span>
        </div>
      );
    };

    const renderActions = params => {
      return (
        <>
          <IconButton
            id="button-edit"
            className="buttonAcciones buttonAcciones-active"
            title="Editar"
            onClick={() => {
              dispatch({
                type: "onEditarLineaClicked",
                payload: {
                  linea: params.row,
                },
              });
            }}
          >
            <Icon>mode_edit</Icon>
          </IconButton>
          <IconButton
            id="button-delete"
            className="buttonAcciones buttonAcciones-active"
            title="Eliminar"
            onClick={() => {
              dispatch({
                type: "onDeleteLineaInventarioClicked",
                payload: {
                  idLinea: params.row.id,
                  referenciaLinea: params.row.referencia,
                },
              });
            }}
          >
            <Icon>delete</Icon>
          </IconButton>
        </>
      );
    };

    const columns = [
      {
        field: "referencia",
        headerName: "Artículo",
        flex: 1,
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

    let totalProcesados = 0;

    lineasInventarios.forEach(linea => {
      totalProcesados += linea.cantidadfin;
    });

    return (
      <div id="EditInventario">
        {renderBack()}
        <div className="main-edit">
          <div className="main-edit-container">
            {showReaderBarcode ? renderBarcode() : null}
            <Box width={1} className="new-linea">
              <h4 className="title-new">Añadir Línea</h4>
              <Box width={1} spacing={2} className="new-linea-container">
                <Box>
                  <Field.Text
                    id="barcode"
                    label="Barcode Reader"
                    autoFocus
                    inputRef={inputRef}
                    onKeyUp={barCodeKeyUp}
                  />
                </Box>
                <Box className="rowMargin">
                  <Field.Int
                    id="qtyAgregar"
                    label="Cantidad"
                    value={qtyAgregar}
                    onChange={e => {
                      dispatch({
                        type: "updateQtyAgregar",
                        payload: {
                          newQty: e.floatValue,
                        },
                      });
                    }}
                    inputProps={{ style: { textAlign: "start" } }}
                  />
                </Box>
                <Box className="rowMargin">
                  <IconButton
                    id="button-add"
                    className="buttonNuevaLinea"
                    title="Añadir"
                    onClick={saveLinea}
                  >
                    <Icon>add_circle</Icon>
                  </IconButton>
                  <IconButton
                    id="button-reader-barcode"
                    className="buttonReaderBarcode"
                    title={
                      !showReaderBarcode
                        ? "Abrir escáner de código de barras"
                        : "Cerrar escáner de código de barras"
                    }
                    onClick={() => {
                      dispatch({
                        type: "setActualReadBarcode",
                        payload: {
                          value: null,
                        },
                      });
                      setShowReaderBarcode(!showReaderBarcode);
                      inputRef.current.focus();
                    }}
                  >
                    <Icon>qr_code_scanner_icon</Icon>
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </div>
          <div className="rowTotal">Total: {totalProcesados}</div>
          <DataGrid
            rows={lineasInventarios}
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableColumnMenu
            disableRowSelectionOnClick
            columns={columns}
            slots={{ toolbar: null }}
            getRowId={row => row.id}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
              },
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
          {lineaSeleccionada ? (
            <Dialog
              id="dialog-edit-linea-inventario"
              open={modalEditVisible}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle id="form-dialog-title">
                {`Editar línea ${lineaSeleccionada.barcode} (${lineaSeleccionada.referencia}-${lineaSeleccionada.talla}) `}
              </DialogTitle>

              <DialogContent id="form-dialog-content">
                <Field.Int
                  id="qtyModificar"
                  label="Cantidad"
                  value={qtyModificada}
                  onChange={e => {
                    dispatch({
                      type: "updateQtyModificada",
                      payload: {
                        newQty: e.floatValue,
                      },
                    });
                  }}
                  inputProps={{ style: { textAlign: "start" } }}
                />
              </DialogContent>

              <DialogActions>
                <div>
                  <Button
                    id="cancelarModicar"
                    text="Cancelar"
                    color="secondary"
                    onClick={() => {
                      dispatch({
                        type: "onCerrarModalEditLinea",
                      });
                    }}
                  />
                  <Button
                    id="confirmarModificar"
                    text="Modificar"
                    color="primary"
                    onClick={() => saveLinea(_, true)}
                  />
                </div>
              </DialogActions>
            </Dialog>
          ) : null}
        </div>
      </div>
    );
  };

  return <Quimera.Template id="EditInventario">{render()}</Quimera.Template>;
}

EditInventario.propTypes = PropValidation.propTypes;
EditInventario.defaultProps = PropValidation.defaultProps;
export default EditInventario;
