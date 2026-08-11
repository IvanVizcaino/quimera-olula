import "./Login.style.scss";

import { Alert, Button, Field, Grid, Icon, Paper, Snackbar, Typography } from "@quimera/comps";
import { clsx } from "@quimera/styles";
import { A } from "hookrouter";
import Quimera, { PropValidation, useStateValue, useWidth } from "quimera";
import { useEffect } from "react";
import { useDbState } from "use-db-state";

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
function Login({ onLogin, useStyles, ...props }) {
  const classes = useStyles();
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const [yearsSelected, setYearsSelected] = useDbState("yearsSelected", "", "ElGansoApp", "Years");
  const [{ autenticado, autenticando, error, loginUser }, dispatch] = useStateValue();
  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        onLogin,
        ...props,
      },
    });
  }, []);

  useEffect(() => {
    autenticado && !!onLogin && onLogin();

    getDbValue("ElGansoApp", "Years", "yearsSelected").then(years => {
      if (!years) {
        const anyoActual = [];
        const y = parseInt(new Date().getYear(), 10) % 100;
        anyoActual.push(y.toString());
        setYearsSelected(anyoActual);
      }
    });
  }, [autenticado]);

  const onKeyPressed = event => {
    event.key === "Enter" &&
      dispatch({
        type: "onEntrarLoginClicked",
      });
  };

  return (
    <Quimera.Template id="Login">
      {!!autenticando && <div>{"Autenticando..."}</div>}
      {!autenticando && !autenticado && (
        <Grid container justifyContent="center" className={`${classes.root} loginPage`}>
          <Grid size={{ xs: 11, sm: 8, md: 4, lg: 3, xl: 2 }}>
            <div className="logo-container">
              <div className="content">
                <img src="/assets/img/ganso.png" className="logo" />
                <h3>Stores</h3>
              </div>
            </div>
            <Paper>
              <Grid container direction="column" className="loginPaper">
                <Grid size="grow" className={clsx(classes.gridItems, classes.header, "header-blue")}>
                  <Typography className={classes.typography} variant="h6">
                    Iniciar sesión
                  </Typography>
                </Grid>
                {/* <Grid size="grow" className={classes.gridItems}>
                  <Field.Text
                    id='user'
                    label='Usuario'
                    fullWidth
                    startAdornment={<Icon>personrounded</Icon>}/>
                </Grid> */}
                <Grid size="grow" className={classes.gridItems}>
                  <Field.Text
                    id="email"
                    label={loginUser.label}
                    fullWidth
                    startAdornment={<Icon>{loginUser.icon}</Icon>}
                    autoFocus={true}
                    onKeyPress={onKeyPressed}
                  />
                </Grid>
                <Grid size="grow" className={classes.gridItems}>
                  <Field.Password
                    id="pass"
                    label="Contraseña"
                    fullWidth
                    startAdornment={<Icon>lockrounded</Icon>}
                    onKeyPress={onKeyPressed}
                  />
                </Grid>
                <Grid size={12} className={classes.gridItems}>
                  <Button
                    id="entrarLogin"
                    text="ENTRAR"
                    variant="text"
                    className={classes.loginButton}
                  />
                </Grid>
                <Grid size={12} className={classes.gridItems}>
                  <A href="/forgot-password">Olvidé mi contraseña</A>
                </Grid>
              </Grid>
            </Paper>
            <Snackbar
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              open={!!error}
              onClose={(event, reason) =>
                dispatch({ type: "onSnackbarAutoHide", payload: { event, reason } })
              }
              autoHideDuration={3000}
              style={{ zIndex: 9998 /* Para que si estamos en modal se muestre */ }}
            >
              <Alert elevation={6} variant="filled" severity="error">
                {error}
              </Alert>
            </Snackbar>
          </Grid>
        </Grid>
      )}
      {!autenticando && !!autenticado && <Quimera.Block id="afterLogin" />}
    </Quimera.Template>
  );
}

Login.propTypes = PropValidation.propTypes;
Login.defaultProps = PropValidation.defaultProps;
export default Login;
