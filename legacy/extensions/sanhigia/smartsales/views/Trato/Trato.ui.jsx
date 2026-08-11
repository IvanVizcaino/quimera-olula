import { Familia } from "@quimera-extension/base-almacen";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Field,
  Grid,
  Icon,
  IconButton,
  Typography,
} from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import Quimera, { ACL, getSchemas, navigate, useStateValue, util } from "quimera";
import { useEffect } from "react";

import {
  ClienteContacto,
  Contacto,
  FabButton,
  FieldTitle,
  FieldValue,
  ListTareas,
  MainBox,
  Note,
  Pedido,
  SSQSection,
  TipoTrato,
} from "../../comps";

function Trato({ idTrato, refreshCallback, deletedCallback, useStyles }) {
  const [
    {
      aprobandoPresupuesto,
      asociandoPedido,
      tratoBuffer,
      noEncontrado,
      modalAdvertirPresupuestoAsociado,
      modalAsociarPedidoVisible,
      modalCrearContactoVisible,
      trato,
      tareas,
      notas,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const agente = util.getGlobalSetting("user_data")?.user?.agente?.toString();

  const tareasList = Object.values(tareas.dict ?? {})
    .filter(tarea => tarea.codAgente === agente || tarea.codAgenteObservador === agente)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map(tarea => tarea.idTarea);

  const schemaTrato = getSchemas()?.trato;
  const schemaCausasPerdidaTrato = getSchemas()?.causasPerdidaTrato;
  const tratoPerdido = tratoBuffer.estado === "Perdido";
  const userIsMKT =
    util.getUser().group === "MKT" || util.getUser().group === "Responsable de marketing"
      ? true
      : false;
  const esVentaProducto = trato?.idTipotrato === 1;
  const classExigirGenerarPedido = trato?.exigirGenerarPedido
    ? "exigirGenerarPedido"
    : "DisablePedido";

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        idTrato,
        refreshCallback,
        deletedCallback,
      },
    });
  }, [idTrato, refreshCallback, deletedCallback]);

  if (noEncontrado) {
    return <Quimera.View id="RegNoEncontrado" />;
  }

  const tratoFarma = trato => trato.idTipotrato === util.getUser().tratolicenciafarma;

  const puedoBorrar = () =>
    trato.estado !== "Ganado" &&
    ((tratoFarma(trato) && trato.codAgente === agente) ||
      (!tratoFarma(trato) && (trato.codAgente === agente || ACL.can("Trato:boton-borrar"))));

  const puedoCrearTarea = () =>
    userIsMKT || trato.codAgente === agente

  return (
    <Quimera.Template id="Trato">
      <Container maxWidth="xs">
        <FabButton
          icon="add"
          text="Tarea"
          disabled={!puedoCrearTarea()}
          onClick={() => navigate(`/ss/trato/${idTrato}/tarea/nueva`)}
        />
        <MainBox title={trato?.titulo} before={true} className="SmartSalesMainBoxTratos">
          <SSQSection
            actionPrefix="cabecera"
            dynamicComp={() => (
              <>
                <Field.Schema id="tratoBuffer.titulo" schema={schemaTrato} fullWidth />
                <Field.Schema id="tratoBuffer.valor" schema={schemaTrato} fullWidth />
              </>
            )}
          >
            <Box w={1} display="flex" justifyContent="space-between">
              <FieldTitle>Valor:</FieldTitle>
              <FieldValue>{util.euros(trato?.valor ?? 0)}</FieldValue>
            </Box>
          </SSQSection>
        </MainBox>
        {!trato.contacto ? (
          <MainBox>
            <Box w={1} display="flex" justifyContent="space-between">
              <FieldTitle>Cliente:</FieldTitle>
              <FieldValue>{trato?.nombreCliente}</FieldValue>
            </Box>
          </MainBox>
        ) : (
          <MainBox>
            <SSQSection
              actionPrefix="contacto"
              dynamicComp={() => (
                <Box display="flex" flexDirection="column" alignItems="flex-end">
                  <Box width={1} display="flex" justifyContent="space-between">
                    <Button
                      id="crearNuevoContacto"
                      text="Crear nuevo contacto"
                      variant="text"
                      color="primary"
                      disabled={
                        util.getUser().group !== "MKT" &&
                        util.getUser().group !== "Responsable de marketing"
                      }
                    />
                    <Button
                      id="editarContacto"
                      text="Editar contacto"
                      variant="text"
                      color="primary"
                    />
                  </Box>
                  <Contacto
                    id="tratoBuffer.contacto"
                    label="Contacto"
                    codCliente={trato.cliente}
                    fullWidth
                    async
                  />
                </Box>
              )}
            >
              <Box w={1} display="flex" justifyContent="space-between">
                <FieldTitle>Contacto:</FieldTitle>
                <Contacto
                  id="tratoBuffer.contacto"
                  label="Contacto"
                  fullWidth
                  estatico
                  StaticComp={FieldValue}
                />
              </Box>
            </SSQSection>
            {trato.cliente && (
              <Box mx={0.5} w={1} display="flex" justifyContent="space-between">
                <FieldTitle>Cliente:</FieldTitle>
                <ClienteContacto
                  id="trato.contacto"
                  label="Cliente"
                  fullWidth
                  estatico
                  StaticComp={FieldValue}
                  disabled={ACL.can("clientes:acceso")}
                />
              </Box>
            )}
          </MainBox>
        )}
        <MainBox>
          <SSQSection
            actionPrefix="tipo"
            dynamicComp={() => (
              <TipoTrato
                id="tratoBuffer.idTipotrato"
                schema={schemaTrato}
                label="Tipo"
                fullWidth
                async
              />
            )}
            saveDisabled={() => !tratoBuffer.idTipotrato}
          >
            <Box w={1} display="flex" justifyContent="space-between">
              <FieldTitle>Tipo:</FieldTitle>
              <FieldValue>{trato?.tipotrato}</FieldValue>
            </Box>
          </SSQSection>
        </MainBox>
        <MainBox>
          <SSQSection
            actionPrefix="codFamilia"
            dynamicComp={() => (
              <>
                <Familia
                  id="tratoBuffer.codFamilia"
                  label="Familia"
                  fullWidth
                  filtroFamilias={
                    tratoBuffer?.familias?.length > 0
                      ? ["codfamilia", "not_in", tratoBuffer?.familias?.map(f => f.codfamilia)]
                      : null
                  }
                />
                <Box my={1}>
                  {(tratoBuffer?.familias ?? []).map(
                    (familia, idx) =>
                      !!familia && (
                        <Box key={familia?.codfamilia} display={"flex"} alignItems={"center"}>
                          <Box>
                            <IconButton
                              id="deleteChildFamiliaProducto"
                              size="small"
                              onClick={() =>
                                dispatch({
                                  type: "onDeleteFamiliaProductoClicked",
                                  payload: { indice: idx },
                                })
                              }
                            >
                              <Icon>close</Icon>
                            </IconButton>
                          </Box>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              style={{
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                minWidth: "0",
                              }}
                            >
                              <span>{familia?.descripcion}</span>
                            </Typography>
                          </Box>
                        </Box>
                      ),
                  )}
                </Box>
              </>
            )}
            saveDisabled={() => !tratoBuffer.idTipotrato}
          >
            <Box w={1} display="flex" flexDirection={"column"} justifyContent="space-between">
              <FieldTitle>Familias de producto:</FieldTitle>
              <Box display="flex" flexDirection="column">
                {(trato.familias ?? []).map(
                  familia =>
                    !!familia && (
                      <Box
                        key={familia?.codfamilia ?? familia}
                        display="flex"
                        alignItems="center"
                        style={{
                          gap: "0.5rem",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          style={{
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            minWidth: "0",
                          }}
                        >
                          {familia?.descripcion}
                        </Typography>
                      </Box>
                    ),
                )}
              </Box>
            </Box>
          </SSQSection>
        </MainBox>
        <MainBox>
          <Box w={1} display="flex" justifyContent="space-between">
            <FieldTitle>Fecha/Hora:</FieldTitle>
            <FieldValue>
              {`${util.formatDate(trato?.fecha)} ${trato?.horaAlta?.substring(0, 5) ?? "00:00"}`}
            </FieldValue>
          </Box>
        </MainBox>
        <MainBox>
          <FieldTitle>Tareas</FieldTitle>
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
        </MainBox>
        {trato && (
          <Quimera.View
            id="EstadoTrato"
            tratoProp={trato}
            refreshCallback={() => dispatch({ type: "refreshCallback" })}
          />
        )}

        {trato?.exigirGenerarPedido && !trato?.idPedido && !trato?.idPresupuesto && (
          <Box style={{ display: "flex", justifyContent: "center" }} my={2}>
            <Button
              id="asociarPedido"
              variant="outlined"
              color="primary"
              text="Asociar pedido"
            // disabled={tratoBuffer.idPerdida}
            />
          </Box>
        )}

        {puedoBorrar() && (
          <Box style={{ display: "flex", justifyContent: "center" }} my={2}>
            <Button
              id="borrarTrato"
              variant="outlined"
              color="primary"
              text="Borrar trato"
            // disabled={tratoBuffer.idPerdida}
            />
          </Box>
        )}
        <MainBox style={{ margin: "20px 5px 0px 0px" }}>
          <SSQSection
            actionPrefix="nota"
            saveDisabled={() => userIsMKT}
            dynamicComp={() => <Field.Text id="nuevaNota" label="Nota" fullWidth multiline />}
          >
            <FieldTitle>Nota:</FieldTitle>
            <Field.Text id="" fullWidth multiline disabled />
            {/* <FieldValue>{tarea?.nota}</FieldValue> */}
          </SSQSection>

          {[...notas?.list]?.reverse().map(nota => (
            <Note key={nota.texto} text={nota.texto} date={util.formatDate(nota.fecha)} />
          ))}
        </MainBox>
        <Dialog
          open={modalCrearContactoVisible}
          fullWidth
          maxWidth="xs"
        // fullScreen={width === "xs" || width === "sm"}
        >
          <Quimera.View
            id="NuevoContacto"
            callbackCerrado={payload => dispatch({ type: "onCerrarCrearContacto", payload })}
          />
        </Dialog>
        <Dialog open={modalAdvertirPresupuestoAsociado}>
          <DialogTitle id="form-dialog-title">Presupuesto asociado</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">
              Este trato tiene un presupuesto asociado, al cambiar a 'Ganado' se generará un pedido
              asociado al mismo y el estado no podrá ser modificado.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {aprobandoPresupuesto ? (
              <Grid container justifyContent="center">
                {" "}
                <br />
                <CircularProgress />
              </Grid>
            ) : (
              <Grid container justifyContent="space-between">
                <Button
                  id="cancelar"
                  text="Cancelar"
                  variant="text"
                  color="secondary"
                  onClick={() => dispatch({ type: "cerrarAdvertirPresupuestoAsociado" })}
                />
                <Button
                  id="confirmar"
                  text="Ok"
                  variant="text"
                  color="primary"
                  onClick={() => dispatch({ type: "onAprobarPresupuestoClicked" })}
                />
              </Grid>
            )}
          </DialogActions>
        </Dialog>

        <Dialog open={modalAsociarPedidoVisible}>
          <DialogTitle id="form-dialog-title">Asociar pedido a trato</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">
              Selecciona el pedido que quieres asociar a este trato.
            </DialogContentText>
            <Grid container justifyContent="center">
              <Pedido
                id="tratoBuffer.idPedido"
                value={tratoBuffer.idPedido}
                // onChange={event => setContacto(event.target.value?.key ?? null)}
                fullWidth
                codCliente={trato.cliente}
                label="Pedido"
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            {asociandoPedido ? (
              <Grid container justifyContent="center">
                {" "}
                <br />
                <CircularProgress />
              </Grid>
            ) : (
              <Grid container justifyContent="space-between">
                <Button
                  id="cancelar"
                  text="Cancelar"
                  variant="text"
                  color="secondary"
                  onClick={() => dispatch({ type: "cerrarModalAsociarPedidoVisible" })}
                />
                <Button
                  id="confirmar"
                  text="Ok"
                  variant="text"
                  color="primary"
                  onClick={() => dispatch({ type: "onAsociarPedidoConfirmClicked" })}
                />
              </Grid>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Quimera.Template>
  );
}

export default Trato;
