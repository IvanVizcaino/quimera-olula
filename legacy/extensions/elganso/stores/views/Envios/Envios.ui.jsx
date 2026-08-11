import { styled } from '@mui/material/styles';
import "./Envios.style.scss";

import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  QuickFilterTrigger,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
  Field,
  Icon,
  IconButton,
} from "@quimera/comps";
import { navigate } from "hookrouter";
import Quimera, { PropValidation, useStateValue, util } from "quimera";
import { useEffect, useState } from "react";
import { useDbState } from "use-db-state";

import { YearInCurso } from "../../comps";

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
function Envios() {
  const usuario = util.getUser();
  const [enviosIndexados, setEnviosIndexados] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [state, dispatch] = useStateValue();
  const [enviosDbIndex, setEnviosDbIndex] = useDbState(
    "enviosDbIndex",
    "",
    "ElGansoApp2",
    "Envios",
  );
  useEffect(() => {
    let filtroYears = [];
    getDbValue("ElGansoApp", "Years", "yearsSelected").then(years => {
      if (!years) {
        const y = parseInt(new Date().getYear(), 10) % 100;
        filtroYears.push(y.toString());
      } else {
        filtroYears = years;
      }
      setFilteredYears(filtroYears);
    });
    getDbValue("ElGansoApp2", "Envios", "enviosDbIndex").then(enviosIndexados => {
      setEnviosIndexados(enviosIndexados);
      dispatch({
        type: "init",
        payload: {
          codalmaorigenFiltro: usuario.codtienda,
          enviosDbIndex: enviosIndexados,
          setEnviosDbIndex,
          anyos: JSON.stringify(filtroYears),
        },
      });
    });
  }, [dispatch]);

  const {
    envios,
    abrirDialogo,
    abrirDialogoSincro,
    dialogTitle,
    idViaje,
    abrirDialogoObtenerEnvios,
    mostrarSoloMisEnvios,
  } = state;

  const render = () => {
    const renderIcon = params => {
      if (
        params.row.usuarioenvio === usuario.user &&
        "lineasModificadas" in params.row &&
        usuario.codtienda === params.row.codalmaorigen
      ) {
        return (
          <IconButton
            id="button-sincro"
            className="buttonSincro buttonSincro-green"
            onClick={() =>
              dispatch({
                type: "onSincroViajeClicked",
                payload: {
                  idViaje: params.row.idviajemultitrans,
                  usuarioEnvio: usuario,
                },
              })
            }
          >
            <Icon>arrow_circle_up</Icon>
          </IconButton>
        );
      }
      if (params.row.usuarioenvio === usuario.user) {
        return (
          <IconButton id="button-sincro" className="buttonSincro buttonSincro-black">
            <Icon>arrow_circle_up</Icon>
          </IconButton>
        );
      }

      return (
        <div className="buttonSincro">
          <Icon>arrow_circle_up</Icon>
        </div>
      );
    };

    const renderViajeName = params => {
      return (
        <div className="viajeName">
          <span>{params.row.nombredestino} - {params.row.idviajemultitrans}</span>
        </div>
      );
    };

    const renderViajeFecha = params => {
      if (!params.row.fechaalta || !params.row.horaalta) {
        return (
          <div className="viajeFecha tableGrid">
            <span>{params.row.fecha}</span>
          </div>
        );
      }

      return (
        <div className="viajeFecha tableGrid">
          <span>{params.row.fechaalta} {params.row.horaalta}</span>
        </div>
      );
    };

    const renderAcciones = params => {
      let active = false;
      if (params.row.usuarioenvio === usuario.user) {
        active = true;
      }

      if (active) {
        return (
          <IconButton
            id="button-edit"
            className="buttonAcciones buttonAcciones-active"
            onClick={() => navigate(`/editenvio/${params.row.idviajemultitrans}`)}
          >
            <Icon>mode_edit</Icon>
          </IconButton>
        );
      }
      if (!params.row.usuarioenvio) {
        return (
          <IconButton
            id="button-edit"
            className="buttonAcciones"
            onClick={() =>
              dispatch({
                type: "onEditViajeClicked",
                payload: {
                  idViaje: params.row.idviajemultitrans,
                  usuarioEnvio: usuario.user,
                },
              })
            }
          >
            <Icon>mode_edit</Icon>
          </IconButton>
        );
      }
    };
    function CustomToolbar() {
      return (
        <Toolbar className="toolbarContainer">
          <YearInCurso className="toolbarContainer-quickFilter" />
          <Field.CheckBox
            id="mostrarSoloMisEnvios"
            label="Mis Envios"
            checked={mostrarSoloMisEnvios}
          />
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
            <IconButton
              id="button-download"
              className="buttonDescargar buttonDescargar-green "
              onClick={() =>
                dispatch({
                  type: "descargarViajes",
                  payload: {
                    enviosDbIndex,
                  },
                })
              }
            >
              <Icon>sync</Icon>
            </IconButton>
          </div>
        </Toolbar>
      );
    }

    const columns = [
      {
        field: "idviajemultitrans",
        headerName: "",
        renderCell: params => renderIcon(params),
        flex: 0.25,
      },
      {
        field: "nombredestino",
        headerName: "VIAJE",
        renderCell: params => renderViajeName(params),
        flex: 2,
      },
      {
        field: "fecha",
        headerName: "FECHA",
        renderCell: params => renderViajeFecha(params),
        flex: 1,
      },
      { field: "cantidad", headerName: "UD", flex: 0.5 },
      { field: "usuarioenvio", headerName: "USER", flex: 0.5 },
      {
        field: "acciones",
        headerName: "",
        renderCell: params => renderAcciones(params),
        flex: 0.25,
      },
    ];

    const enviosFiltered = [];

    filteredYears.forEach(filteredYear => {
      let envioFilteredAux = [];
      const fechaIncio = `20${filteredYear}-01-01`;
      const fechaFin = `20${filteredYear}-12-31`;
      envioFilteredAux = envios.filter(
        envio => envio.fecha >= fechaIncio && envio.fecha <= fechaFin,
      );

      let envioFilteredAuxFinal = [];
      if (mostrarSoloMisEnvios) {
        envioFilteredAuxFinal = envioFilteredAux.filter(
          envio => envio.usuarioenvio === usuario.user,
        );
      } else {
        envioFilteredAuxFinal = envioFilteredAux;
      }

      enviosFiltered.push(...envioFilteredAuxFinal);
    });

    if (envios.length > 0 && enviosFiltered.length === 0) {
      return (
        <div id="Envios" className="page-container">
          <h2 className="main">Envios</h2>
          <div className="text-actualizar">
            No dispone de envios descargados para el año seleccionado
          </div>
          <div className="botonActualizar">
            <IconButton
              id="button-download"
              onClick={() =>
                dispatch({
                  type: "descargarViajes",
                  payload: {
                    enviosDbIndex,
                  },
                })
              }
            >
              Actualizar
              <Icon className="buttonSincro">sync</Icon>
            </IconButton>
          </div>
          <Container>
            <Dialog open={abrirDialogoObtenerEnvios} fullWidth maxWidth="md">
              <DialogTitle id="form-dialog-sincro-title">{dialogTitle}</DialogTitle>
              <DialogActions>
                <div>
                  <Button id="cancelarObtenerEnvios" text="Cancelar" color="secondary" />
                  <Button
                    id="obtenerEnvios"
                    text="Aceptar"
                    color="primary"
                    onClick={() => {
                      let filtroYears = [];
                      getDbValue("ElGansoApp", "Years", "yearsSelected").then(years => {
                        if (!years) {
                          const y = parseInt(new Date().getYear(), 10) % 100;
                          filtroYears.push(y.toString());
                        } else {
                          filtroYears = years;
                        }
                        dispatch({
                          type: "init",
                          payload: {
                            codalmaorigenFiltro: usuario.codtienda,
                            enviosDbIndex: [],
                            setEnviosDbIndex,
                            anyos: JSON.stringify(filtroYears),
                          },
                        });
                      });
                    }}
                  />
                </div>
              </DialogActions>
            </Dialog>
          </Container>
        </div>
      );
    }

    return (
      <div id="Envios" className="page-container">
        <h2 className="main">Envíos</h2>
        <DataGrid
          rows={enviosFiltered}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnMenu
          disableRowSelectionOnClick
          columns={columns}
          slots={{ toolbar: CustomToolbar }}
          localeText={{
            noRowsLabel: "No hay envíos",
            toolbarQuickFilterPlaceholder: "Buscar...",
            paginationRowsPerPage: "Líneas por página",
            paginationDisplayedRows: ({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
            footerRowSelected: (count) =>
              count !== 1
                ? `${count} filas seleccionadas`
                : `${count} fila seleccionada`,
          }}
          getRowId={row => row.idviajemultitrans}
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
          <Dialog open={abrirDialogo} fullWidth maxWidth="md">
            <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
            <DialogActions>
              <div>
                <Button id="cancelarAsignacion" text="No" color="secondary" />
                <Button
                  id="asignar"
                  text="Sí"
                  color="primary"
                  onClick={() => {
                    dispatch({
                      type: "onAsignarUsuarioEnvio",
                      payload: {
                        idviajemultitrans: idViaje,
                        usuarioenvio: usuario.user,
                        envios,
                        setEnviosDbIndex,
                        setEnviosIndexados,
                      },
                    });
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>

          <Dialog open={abrirDialogoSincro} fullWidth maxWidth="md">
            <DialogTitle id="form-dialog-sincro-title">{dialogTitle}</DialogTitle>
            <DialogActions>
              <div>
                <Button id="cancelarAsignacionSincro" text="No" color="secondary" />
                <Button
                  id="asignarSincro"
                  text="Sí"
                  color="primary"
                  onClick={() => {
                    dispatch({
                      type: "onSincroEnvio",
                      payload: {
                        idviajemultitrans: idViaje,
                        usuarioenvio: usuario.user,
                        envios,
                        setEnviosDbIndex,
                        setEnviosIndexados,
                      },
                    });
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>
          <Dialog open={abrirDialogoObtenerEnvios} fullWidth maxWidth="md">
            <DialogTitle id="form-dialog-sincro-title">{dialogTitle}</DialogTitle>
            <DialogActions>
              <div>
                <Button id="cancelarObtenerEnvios" text="Cancelar" color="secondary" />
                <Button
                  id="obtenerEnvios"
                  text="Aceptar"
                  color="primary"
                  onClick={() => {
                    let filtroYears = [];
                    getDbValue("ElGansoApp", "Years", "yearsSelected").then(years => {
                      if (!years) {
                        const y = parseInt(new Date().getYear(), 10) % 100;
                        filtroYears.push(y.toString());
                      } else {
                        filtroYears = years;
                      }
                      dispatch({
                        type: "init",
                        payload: {
                          codalmaorigenFiltro: usuario.codtienda,
                          enviosDbIndex: [],
                          setEnviosDbIndex,
                          anyos: JSON.stringify(filtroYears),
                        },
                      });
                    });
                  }}
                />
              </div>
            </DialogActions>
          </Dialog>
        </Container>
      </div>
    );
  };

  return <Quimera.Template id="Envios">{render()}</Quimera.Template>;
}

Envios.propTypes = PropValidation.propTypes;
Envios.defaultProps = PropValidation.defaultProps;
export default Envios;
