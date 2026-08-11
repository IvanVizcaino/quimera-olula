import { AppBar, HGrid, Icon, IconButton, Toolbar } from "@quimera/comps";
import {
  Alert,
  Button as ButtonMUI,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Hidden,
  isWidthUp,
  Snackbar,
  Typography,
} from "@quimera/thirdparty";
import Quimera, { A, useAppValue, useStateValue, useWidth } from "quimera";
import React, { useEffect } from "react";

const TransitionConfirm = React.forwardRef(function Transition(props, ref) {
  return <Collapse ref={ref} timeout={1} {...props} />;
});

function Header({ useStyles }) {
  const [{ drawerAbierto }] = useStateValue();
  const [appState, appDispatch] = useAppValue();
  const classes = useStyles();
  const width = useWidth();
  useEffect(() => {
    if (isWidthUp("sm", width) && appState.vistaMovil) {
      appDispatch({ type: "setVistaMovil", payload: false });
      // } else if (!isWidthUp('sm', width) && !appState.vistaMovil) {
    } else if (width === "xs" && !appState.vistaMovil) {
      appDispatch({ type: "setVistaMovil", payload: true });
    }
  }, [width, appState.vistaMovil, appDispatch]);

  return (
    <Quimera.Template id="Header">
      <AppBar position="fixed" style={{ backgroundColor: "white" }}>
        <HGrid justifyContent="space-between" alignItems="center">
          <Grid container justifyContent="flex-start" direction="row">
            <Toolbar style={{ paddingRight: 0 }}>
              <A href="/">
                <img src="static/images/logoVbarba.png" />
              </A>
              <Hidden xsDown>
                <Grid style={{ marginLeft: "8px" }}>
                  <Grid size="grow" zeroMinWidth>
                    {" "}
                    <Typography noWrap className={classes.tituloPaginaActualDesktop}>
                      {appState.nombrePaginaActual}
                    </Typography>
                  </Grid>
                </Grid>
              </Hidden>
            </Toolbar>
          </Grid>
          <Grid container justifyContent="flex-start" direction="row"></Grid>
          <Grid container justifyContent="flex-end" direction="row">
            <IconButton id="menuDerecha">
              <Icon>person</Icon>
            </IconButton>
          </Grid>
        </HGrid>
        <Hidden smUp>
          <HGrid justifyContent="center" alignItems="center" style={{ marginBottom: "4px" }}>
            <Grid size="grow" zeroMinWidth>
              <Typography align="center" noWrap className={classes.tituloPaginaActualMobile}>
                {appState.nombrePaginaActual}
              </Typography>
            </Grid>
          </HGrid>
        </Hidden>
      </AppBar>
      {drawerAbierto ? <Quimera.SubView id="Header/HeaderDrawer" /> : null}

      {/** Errores y avisos generales de todas las vistas */}
      {/* appState.mensaje !== '' ? alert('En header, appstate: ' + appState.mensaje) : null */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={appState.mensaje !== ""}
        onClose={(event, reason) =>
          appDispatch({ type: "onSnackbarAutoHide", payload: { event, reason } })
        }
        autoHideDuration={8000}
        style={{ zIndex: 9998 /* Para que si estamos en modal se muestre */ }}
      /*  message={appState.mensaje} */
      >
        {appState.tipoMensaje ? (
          <Alert elevation={6} variant="filled" severity={appState.tipoMensaje}>
            {appState.mensaje}
          </Alert>
        ) : null}
      </Snackbar>

      {/** Dialogo confirmacion general de todas las vistass */}
      {console.log("OBJETO CONFIRM", appState.objetoConfirm)}
      <Dialog
        open={appState.objetoConfirm !== null}
        TransitionComponent={TransitionConfirm}
        keepMounted
        onClose={() => appDispatch({ type: "onCerrarConfirm", payload: {} })}
        style={{ zIndex: 9998 /* Para que si estamos en modal se muestre */ }}
      >
        <DialogTitle>
          {" "}
          {appState.objetoConfirm !== null && (appState.objetoConfirm.titulo || "")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {appState.objetoConfirm !== null ? appState.objetoConfirm.cuerpo : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <ButtonMUI
            onClick={() => appDispatch({ type: "onConfirmarConfirm", payload: {} })}
            color="primary"
            autoFocus
          >
            {appState.objetoConfirm !== null
              ? appState.objetoConfirm.textoSi
                ? appState.objetoConfirm.textoSi
                : "Aceptar"
              : ""}
          </ButtonMUI>
          <ButtonMUI
            onClick={() => appDispatch({ type: "onCerrarConfirm", payload: {} })}
            color="primary"
          >
            {appState.objetoConfirm !== null
              ? appState.objetoConfirm.textoNo
                ? appState.objetoConfirm.textoNo
                : "Cancelar"
              : ""}
          </ButtonMUI>
        </DialogActions>
      </Dialog>
    </Quimera.Template>
  );
}

export default Header;
