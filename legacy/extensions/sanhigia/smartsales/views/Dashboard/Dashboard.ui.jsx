import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  QSection,
  Typography,
} from "@quimera/comps";
import Quimera, { navigate, useStateValue, util } from "quimera";
import { useEffect } from "react";

import {
  ListTareas,
  ListTratos,
  MainBox,
  Progress,
  SearchContacto,
  SearchRecomCliente,
  SearchRecomDireccion,
  SearchRecomSubfamilia,
} from "../../comps";

import { Agente } from "@quimera-extension/base-ventas";
import { ComunicacionesResumen } from "../../../../../../apps/sanhigia/src/contextos/smartsales/ComunicacionesResumen.tsx";

function Dashboard({ useStyles }) {
  const [
    {
      codAgenteCustom,
      modalCambiarAgente,
      modalTareasAtrasadas,
      previsiones,
      totalInteraccionesCursos,
      totalInteraccionesActivos,
      totalTratosMkt,
      totalTratosObservadorFarma,
      tratos,
      tareas,
      searchRecomCliente,
      searchRecomDireccion,
      searchRecomSubfamilia,
      modalCrearContactoVisible,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const usuario = util.getUser?.();
  const esUsuarioMarketing =
    usuario?.group === "MKT" || usuario?.group === "Responsable de marketing";
  const sinFiltroAgente =
    usuario?.superuser || esUsuarioMarketing;
  const agente = util.getGlobalSetting("user_data")?.user?.agente?.toString();
  const tratosList = tratos.list
    .filter(trato => trato.codAgente === agente)
    ?.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const tareasList = Object.values(tareas.dict ?? {})
    .filter(tarea => sinFiltroAgente || tarea.codAgente === agente)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(tarea => tarea.idTarea);

  useEffect(() => {
    dispatch({
      type: "onInit",
    });
  }, [dispatch]);

  console.log('mimensaje_agentes: previsiones.codAgente: ', previsiones.codAgente, ", agente: ", agente, "condicion: ", previsiones.codAgente === 'TODOS' || previsiones.codAgente === agente);
  const verSoloProgress =
    previsiones.codAgente === 'TODOS' ||
    (previsiones.codAgente === agente && !usuario?.superuser)

  return (
    <Quimera.Template id="Dashboard">
      <Container maxWidth="xs" className={classes.container}>
        <Progress />
        {/* <MainBox display="flex" justifyContent="center">
          <Button id="verGrafico" variant="outlined">
            Ver gráfico
          </Button>
        </MainBox> */}

        {verSoloProgress &&
          <>
            <MainBox display="flex" justifyContent="space-between">
              <Button id="crearNuevoContacto" variant="outlined">
                Nuevo Contacto
              </Button>
              <Button
                id="crearNuevoTrato"
                variant="outlined"
                onClick={() => navigate("/ss/trato/nuevo")}
              >
                Nuevo Trato
              </Button>
            </MainBox>
            <MainBox title="Comunicaciones">
              <br />
              <ComunicacionesResumen />
            </MainBox>
            <MainBox className={classes.agendaBox} title="Agenda" url="/ss/agenda">
              <SearchContacto navigation={true} />

              {totalInteraccionesCursos > 0 && (
                <Box
                  className={classes.botonAlertaHeader}
                  onClick={() => navigate("/ss/contactos/cursos/")}
                >
                  <Typography variant="h3" className={classes.mainBoxSubtitle}>
                    Contactos de cursos
                  </Typography>
                  <span className={classes.listItemTarea}>
                    <span className={classes.listItemTareaAux}>{totalInteraccionesCursos}</span>
                  </span>
                </Box>
              )}

              {totalInteraccionesActivos > 0 && (
                <Box
                  className={classes.botonAlertaHeader}
                  onClick={() => navigate("/ss/contactos/activos/")}
                >
                  <Typography variant="h3" className={classes.mainBoxSubtitle}>
                    Contactos más activos en últimos meses
                  </Typography>
                  <span className={classes.listItemTarea}>
                    <span className={classes.listItemTareaAux}>{totalInteraccionesActivos}</span>
                  </span>
                </Box>
              )}

              <Box display="flex" justifyContent="space-between">
                <Typography variant="h3" className={classes.mainBoxSubtitle} data-cy="title-tratos">
                  Tratos
                </Typography>
                <Button id="verTratos" variant="outlined" onClick={() => navigate("/ss/tratos")}>
                  Ver todos
                </Button>
              </Box>

              <ListTratos
                tratos={{
                  ...tratos,
                  list: tratosList,
                }}
              />

              {totalTratosObservadorFarma > 0 && (
                <Box
                  className={classes.botonAlertaHeader}
                  onClick={() => navigate("/ss/tratos/modo/observadorfarma")}
                >
                  <Typography variant="h3" className={classes.mainBoxSubtitle}>
                    Tratos de licencia farmacéutica
                  </Typography>
                  <span className={classes.listItemTarea}>
                    <span className={classes.listItemTareaAux}>{totalTratosObservadorFarma}</span>
                  </span>
                </Box>
              )}

              {(totalTratosMkt > 0 ||
                usuario?.superuser ||
                esUsuarioMarketing) && (
                  <Box className={classes.botonAlertaHeader} onClick={() => navigate("/ss/tratosmkt")}>
                    <Typography variant="h3" className={classes.mainBoxSubtitle}>
                      Tratos de venta de formación
                    </Typography>
                    {usuario?.group !== "MKT" ||
                      (usuario?.group !== "Responsable de marketing" && (
                        <span className={classes.listItemTarea}>
                          <span className={classes.listItemTareaAux}>{totalTratosMkt}</span>
                        </span>
                      ))}
                    {/* {util.getUser().group == "MKT" && (
                <Button id="verTratos" variant="outlined" onClick={() => navigate("/ss/tratos")}>
                  Ver todos
                </Button>
              )} */}
                  </Box>
                )}

              <QSection
                title=""
                readOnly
                focusStyle="none"
                close={{ display: "none" }}
                dynamicComp={desactivar => (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <Typography
                        variant="h3"
                        className={classes.mainBoxSubtitle}
                        onClick={() => desactivar()}
                        data-cy="title-tareas"
                      >
                        Tareas
                      </Typography>

                      <Button id="verTareas" variant="outlined" onClick={() => navigate("/ss/tareas")}>
                        Ver todas
                      </Button>
                    </Box>

                    <ListTareas
                      tareas={{
                        ...tareas,
                        idList: tareasList,
                        dict: tareasList
                          .map(key => tareas?.dict[key])
                          .reduce(
                            (accum, tarea) => ({
                              ...accum,
                              [tarea.idTarea]: tarea,
                            }),
                            {},
                          ),
                      }}
                    />
                  </>
                )}
              >
                <Box className={classes.tareasHeader}>
                  <Typography variant="h3" className={classes.mainBoxSubtitle}>
                    Tareas
                  </Typography>
                  <span className={classes.listItemTarea}>
                    <span className={classes.listItemTareaAux}>{tareasList?.length}</span>
                  </span>
                  {/* <BigNumUd data={[tareas.dict[tareas.idList?.[0]]?.hora, 'h.']} /> */}
                </Box>
              </QSection>
            </MainBox>


            <Box display="flex" flexDirection="column" alignItems="center" style={{ gap: "1rem" }}>
              <Quimera.View id="HistoricoPrevision" />
              <Button
                color="secondary"
                text=">> Ver histórico por familias"
                onClick={() => navigate("/ss/historico/")}
              />
            </Box>

            <MainBox title="Recomendaciones">
              <br />
              <Typography variant="h3" className={classes.mainBoxSubtitle}>
                Subfamilias para cliente
              </Typography>
              <SearchRecomCliente id="searchRecomCliente" />
              <SearchRecomDireccion
                id="searchRecomDireccion"
                codCliente={searchRecomCliente}
                disabled={!searchRecomCliente}
              />
              <Button
                id="goRecomCliente"
                variant="contained"
                color="primary"
                style={{ margin: "10px 0 25px 0" }}
                disabled={!searchRecomDireccion}
              >
                Ver subfamilias =&gt;
              </Button>
              <br />
              <Typography variant="h3" className={classes.mainBoxSubtitle}>
                Clientes para subfamilia
              </Typography>
              <SearchRecomSubfamilia id="searchRecomSubfamilia" />
              <Button
                id="goRecomSubfamilia"
                variant="contained"
                color="primary"
                style={{ margin: "10px 0 25px 0" }}
                disabled={!searchRecomSubfamilia}
              >
                Ver clientes =&gt;
              </Button>
            </MainBox>
          </>
        }

        <Dialog open={modalTareasAtrasadas} maxWidth="xs">
          <DialogTitle
            id="form-dialog-title"
            display="flex"
            justifyContent="center"
            style={{ display: "flex", justifyContent: "center" }}
          >
            Aviso
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">
              Existen tareas atrasadas no completadas
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Grid container justifyContent="space-between">
              <Button
                id="cerrar"
                text="Cerrar"
                variant="text"
                color="secondary"
                onClick={() => dispatch({ type: "cerrarModalTareasAtrasadas" })}
              />
              <Button
                id="verTratos"
                text="Ver tratos"
                variant="text"
                color="primary"
                onClick={() => dispatch({ type: "verTratosTareasAtrasadasClicked" })}
              />
            </Grid>
          </DialogActions>
        </Dialog>
        <Dialog open={modalCrearContactoVisible} fullWidth maxWidth="xs">
          <Quimera.View
            id="NuevoContacto"
            callbackCerrado={payload => dispatch({ type: "onCerrarCrearContacto", payload })}
          />
        </Dialog>

        <Dialog open={modalCambiarAgente} maxWidth="xs">
          <DialogTitle
            id="form-dialog-title"
            display="flex"
            justifyContent="center"
            style={{ display: "flex", justifyContent: "center" }}
          >
            Cambiar agente a seguir
          </DialogTitle>
          <DialogContent>
            <Agente id="codAgenteCustom" fullWidth async />
          </DialogContent>
          <DialogActions>
            <Grid container justifyContent="space-between">
              <Button
                id="cerrar"
                text="Cerrar"
                variant="text"
                color="secondary"
                onClick={() => dispatch({ type: "cerrarModalCambiarAgente" })}
              />
              <Button
                id="cambiarAgente"
                text="Cambiar"
                variant="text"
                color="primary"
                onClick={() => dispatch({ type: "cambiarAgenteConfirmado" })}
              />
            </Grid>
          </DialogActions>
        </Dialog>

      </Container>
    </Quimera.Template>
  );
}

export default Dashboard;
