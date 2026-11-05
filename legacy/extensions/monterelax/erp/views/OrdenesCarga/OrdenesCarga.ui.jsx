// import { Grid, Button, Column, Field, Table, Dialog, DialogContent, IconButton, Icon, Typography } from '@quimera/comps'
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Icon, IconButton, Typography } from "@quimera/comps";
import { Avatar, Button as BotonMUI, LinearProgress, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText } from "@quimera/thirdparty";
import Quimera, { navigate, useAppValue, useStateValue, util } from "quimera";
import { useEffect, useState } from "react";

import { getReportAlbaranesOrdenCarga, terminarOrdenCarga } from "./report_olula";

function OrdenesCarga({ useStyles }) {
  const [
    {
      albaranes,
      albaranesGenerados,
      abrirDialogoConfirmacion,
      cargandoAlbaranes,
      errorAlbaranes,
      dialogTitle,
      dialogMsg,
      idOrdenCarga,
      impresionDone,
      imprimirAlbaranes,
      ordenescarga,
    },
    dispatch,
  ] = useStateValue();
  const [, appDispatch] = useAppValue();
  const classes = useStyles();

  useEffect(() => {
    dispatch({
      type: "onInit",
    });
  }, [dispatch]);

  useEffect(() => {
    appDispatch({ type: "setNombrePaginaActual", payload: { nombre: "Órdenes de carga" } });

    return () => appDispatch({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [appDispatch]);

  const [ordenAConfirmar, setOrdenAConfirmar] = useState(null);

  const descargarAlbaranesYTerminar = async idOrden => {
    try {
      const blob = await getReportAlbaranesOrdenCarga(idOrden);
      await descargarDocumento(blob, `${idOrden}.pdf`);
      await terminarOrdenCarga(idOrden);
      dispatch({ type: "cargarOrdenesCarga" });
    } catch (error) {
      dispatch({ type: "onErrorReportOlula", payload: error });
    }
  };

  return (
    <Quimera.Template id="OrdenesCarga">
      <Container maxWidth="md" className={classes.container}>
        <List>
          {ordenescarga.map(ordencarga => (
            //<a href={ `/ordenDeCargaDetalle/${ordencarga.idorden}` } className={ classes.enlaceOrden }>
            <ListItem
              key={ordencarga.idorden}
              divider={true}
              className={classes.element}
              onClick={() => navigate(`/ordenDeCargaDetalle/${ordencarga.idorden}`)}
            >
              {/* <ListItem key={ordencarga.idorden} divider={true} className={classes.element}> */}
              <ListItemAvatar>
                <Avatar className={ordencarga.estado === "PTE" ? classes.yellow : classes.green}>
                  {ordencarga.partidas /* ordencarga.estado === 'PTE' ? 'P' : 'C' */}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography>
                    <strong>{util.formatDate(ordencarga.fecha)}</strong>
                    {` ${ordencarga.idorden} (${ordencarga.estado})`}
                  </Typography>
                }
                secondary={
                  <span>
                    <Typography component={"span"}>
                      Camión:{" "}
                      <strong>
                        {` ${ordencarga.codcamion.length}` > 0
                          ? ordencarga.codcamion
                          : "No establecido"}
                      </strong>
                      &nbsp; Ruta:{" "}
                      <strong>
                        {ordencarga.codruta === null ? " No establecida" : ` ${ordencarga.codruta}`}
                      </strong>
                    </Typography>
                  </span>
                }
              ></ListItemText>
              {
                <ListItemSecondaryAction>
                  {ordencarga.estado === "ALBARANADA" && (
                    <>
                      <IconButton
                        edge="end"
                        aria-label="albaranes de la orden de carga"
                        title="Albaranes de la orden de carga"
                        onClick={event => {
                          event.stopPropagation();
                          setOrdenAConfirmar(ordencarga.idorden);
                        }}
                      >
                        <Icon>picture_as_pdf</Icon>
                      </IconButton>
                      <IconButton
                        visible={ordencarga.estado === "ALBARANADA"}
                        edge="end"
                        aria-label="imprimir"
                        onClick={() =>
                          dispatch({
                            type: "onImprimirClicked",
                            payload: { data: ordencarga.idorden },
                          })
                        }
                      >
                        <Icon>print</Icon>
                      </IconButton>
                    </>
                  )}
                  {ordencarga.estado !== "ALBARANADA" && (
                    <IconButton
                      id="finalizar"
                      edge="end"
                      aria-label="finalizar"
                      onClick={() =>
                        dispatch({
                          type: "onTerminarClicked",
                          payload: { data: ordencarga.idorden },
                        })
                      }
                    >
                      <Icon>done</Icon>
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              }
            </ListItem>
          ))}
        </List>
        <Dialog open={ordenAConfirmar !== null} maxWidth="md">
          <DialogTitle id="form-dialog-title">Albaranes de la orden de carga</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">
              {`Se van a descargar los albaranes de la orden de carga ${ordenAConfirmar} ¿Desea continuar?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <BotonMUI
              onClick={() => {
                const idOrden = ordenAConfirmar;
                setOrdenAConfirmar(null);
                descargarAlbaranesYTerminar(idOrden);
              }}
            >
              Sí
            </BotonMUI>
            <BotonMUI onClick={() => setOrdenAConfirmar(null)}>No</BotonMUI>
          </DialogActions>
        </Dialog>

        {/* Son varios diálogos los que aparecen en el proceso. Van en orden de aparición */}
        <Dialog open={abrirDialogoConfirmacion} maxWidth="md">
          <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">{dialogMsg}</DialogContentText>
          </DialogContent>
          <DialogActions>
            {dialogTitle === "Aviso" ? (
              <Button id="ok" text="OK" />
            ) : (
              <div>
                <Button id="confirmarAlbaranes" text="Sí" />
                <Button id="cancelarAlbaranes" text="No" />
              </div>
            )}
          </DialogActions>
        </Dialog>
        <Dialog open={errorAlbaranes} maxWidth="md">
          <DialogTitle id="form-dialog-title">Error</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">{dialogMsg}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button id="ok" text="OK" />
          </DialogActions>
        </Dialog>

        <Dialog open={cargandoAlbaranes} maxWidth="md">
          <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">{dialogMsg}</DialogContentText>
            <LinearProgress></LinearProgress>
          </DialogContent>
        </Dialog>

        <Dialog open={albaranesGenerados} maxWidth="md">
          <DialogTitle id="form-dialog-title"> {dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">{dialogMsg}</DialogContentText>
            <List>
              {albaranes.map(a => (
                <ListItem key={a.albaran.codalbaran}>
                  <ListItemText>
                    <Typography>
                      <strong>Albarán: </strong>
                      {a.albaran.codalbaran} &nbsp; <strong>Serie: </strong>
                      {a.albaran.codserie} &nbsp; <strong>Descuento </strong>
                      {a.albaran.descuento} &nbsp; <strong>Cliente: </strong>
                      {a.albaran.codcliente} - {a.albaran.nombre}
                    </Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
            <DialogActions>
              <Button id="cerrarAlbaranesGenerados" text="OK" />
            </DialogActions>
          </DialogContent>
        </Dialog>

        <Dialog open={imprimirAlbaranes} maxWidth="md">
          <DialogTitle id="form-dialog-title"> {dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">{dialogMsg}</DialogContentText>
            <List>
              {albaranes.map(a => (
                <ListItem key={a.albaran.codalbaran}>
                  <ListItemText>
                    <Typography>
                      <strong>Albarán: </strong>
                      {a.albaran.codalbaran}
                    </Typography>
                  </ListItemText>
                </ListItem>
              ))}
            </List>
            <DialogActions>
              <Button id="confirmarImpresion" text="OK" />
            </DialogActions>
          </DialogContent>
        </Dialog>

        <Dialog open={impresionDone} maxWidth="md">
          <DialogTitle id="form-dialog-title">{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">{dialogMsg}</DialogContentText>
            <DialogActions>
              <Button id="terminarImpresion" text="OK" />
            </DialogActions>
          </DialogContent>
        </Dialog>
      </Container>
    </Quimera.Template>
  );
}

export default OrdenesCarga;
