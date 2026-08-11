import { SelectorValores } from "@quimera-extension/base-almacen";
import { Box, Button, Field, Grid, Icon, Paper, Typography } from "@quimera/comps";
import { clsx, makeStyles } from "@quimera/styles";
import { useTranslation } from "@quimera/thirdparty";
import Quimera, { getSchemas, navigate, useStateValue, useWidth, util } from "quimera";
import { useEffect, useState } from "react";

import initialData from "./initial-data";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "center",
    // alignItems: "center",
    height: "100vh",
  },
  gridItems: {
    margin: theme.spacing(2),
    textAlign: "center",
  },
  gridLines: {
    padding: theme.spacing(2),
    // textAlign: "center",
  },
  header: {
    flexBasis: "100px",
    background: "linear-gradient(60deg, #D95578, #f25e86)",
    marginTop: "-40px",
    color: "#FFF",
    boxShadow:
      "0 12px 20px -10px rgba(156, 39, 176, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(156, 39, 176, 0.2)",
    borderRadius: "3px",
    padding: "40px",
  },
  typography: {
    fontWeight: "700",
  },
  typographySmall: {
    fontWeight: "400",
    fontSize: "14px",
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // height: "50vh",
  },
  signupButton: {
    "width": "140px",
    "color": "#D95578",
    "transition": "0.5s ease-out",
    "&:hover": {
      backgroundColor: "#D95578",
      color: "#fff",
    },
  },
}));

function Signup({ hash }) {
  const [{ consumidor, smState, email, error, repeatedPassword }, dispatch] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const { t } = useTranslation();
  const schema = getSchemas().nuevoConsumidor;

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: { hash },
    });
  }, [dispatch, hash]);

  const tiposGenero = initialData.tiposGenero;
  const provincias = initialData.provincias;

  const MIN_PASS_LENGTH = 6;
  const TR_PREFIX = "login.signup.";

  // console.log("mimensaje_initialData", initialData);
  const [passwordStatus, setPasswordStatus] = useState({ ok: false });
  const validation = consumidor => {
    return schema.isValid(consumidor);
  };

  useEffect(() => {
    if (smState == "establecer_nuevo_consumidor") {
      setPasswordStatus(passwordsOK(consumidor.buffer.password, repeatedPassword));
    }
  }, [smState, consumidor.buffer.password, repeatedPassword]);

  function passwordOK(pass) {
    return pass && pass != "" && pass.length >= MIN_PASS_LENGTH;
  }
  function passwordsOK(pass1, pass2, t) {
    const result = {
      ok: true,
      pass1Msg: null,
      pass2Msg: null,
    };
    if (!passwordOK(pass1)) {
      result.ok = false;
      result.pass1Msg =
        pass1 &&
        util.translate(`${TR_PREFIX}crearUsuarioPasswordIncorrecto`, {
          minLength: MIN_PASS_LENGTH,
        });
    }
    if (!passwordOK(pass2)) {
      result.ok = false;
      result.pass2Msg =
        pass2 &&
        util.translate(`${TR_PREFIX}crearUsuarioPasswordIncorrecto`, {
          minLength: MIN_PASS_LENGTH,
        });
    }
    if (!result.ok) {
      return result;
    }
    if (pass1 != pass2) {
      result.ok = false;
      result.pass2Msg = util.translate(`${TR_PREFIX}passwordsDistintas`);
    }

    return result;
  }

  return (
    <Quimera.Template id="Signup">
      <Grid container justifyContent="center" className={classes.root}>
        <Grid size={12} className={classes.logo}>
          <img alt="Project logo" src="/img/logo_url_oscuro.png" width={mobile ? "90%" : "15%"} />
        </Grid>
        {(smState === "establecer_nuevo_consumidor" || smState === "creando_consumidor") && (
          <Grid size={{ xs: 11, sm: 8, md: 8, lg: 6, xl: 4 }} style={{ marginTop: mobile ? "50px" : "inherit" }}>
            <Paper>
              <Grid container direction="column">
                <Grid size="grow" className={clsx(classes.gridItems, classes.header)}>
                  <Typography className={classes.typography} variant="h5">
                    Introduzca sus datos
                  </Typography>
                </Grid>
                <Grid container size="grow" className={classes.gridLines}>
                  <Grid size={mobile ? 12 : 5}>
                    <Field.Schema
                      id="consumidor.buffer/nombre"
                      label={"Nombre"}
                      fullWidth
                      startAdornment={<Icon>person</Icon>}
                    />
                  </Grid>
                  <Grid size={mobile ? 0 : 1} />
                  <Grid size={mobile ? 12 : 6}>
                    <Field.Schema
                      id="consumidor.buffer/apellidos"
                      label={"Apellidos"}
                      fullWidth
                      startAdornment={<Icon>person</Icon>}
                    />
                  </Grid>

                  <Grid size={mobile ? 12 : 3}>
                    <Field.Schema
                      id="consumidor.buffer/telefono"
                      label={"Teléfono"}
                      fullWidth
                      startAdornment={<Icon>phone</Icon>}
                    />
                  </Grid>
                  <Grid size={mobile ? 0 : 1} />
                  <Grid size={mobile ? 12 : 4}>
                    <Field.Schema
                      id="consumidor.buffer/cifnif"
                      label={"D.N.I./Pasaporte/T. Resi."}
                      fullWidth
                      startAdornment={<Icon>subtitles</Icon>}
                    />
                  </Grid>
                  <Grid size={mobile ? 0 : 1} />

                  <Grid size={mobile ? 12 : 3}>
                    <Field.Date
                      id="consumidor.buffer/fechanacimiento"
                      label="F. nacimiento"
                      fullWidth
                    />
                  </Grid>
                  <Grid size={mobile ? 12 : 6}>
                    <Field.Text
                      id="consumidor.buffer/ciudad"
                      label="Ciudad"
                      fullWidth
                      startAdornment={<Icon>home</Icon>}
                    />
                  </Grid>

                  <Grid size={mobile ? 0 : 1} />
                  <Grid size={mobile ? 12 : 3}>
                    <Field.Text id="consumidor.buffer/cp" label="Código postal" fullWidth />
                  </Grid>

                  <Grid size={mobile ? 12 : 6} style={{
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: "4px",
                  }}>
                    <SelectorValores
                      id="consumidor.buffer/idprovincia"
                      stateField="idprovincia"
                      label="Provincia"
                      valores={provincias}
                      value={consumidor.buffer.idprovincia}
                      arrayKeyValue
                      fullWidth
                    ></SelectorValores>
                  </Grid>
                  <Grid size={mobile ? 0 : 1} />
                  <Grid size={mobile ? 12 : 3} style={{
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: "4px",
                  }}>
                    <SelectorValores
                      id="consumidor.buffer/genero"
                      stateField="genero"
                      label="Género"
                      valores={tiposGenero}
                      value={consumidor.buffer.genero}
                      arrayKeyValue
                      fullWidth
                    ></SelectorValores>
                  </Grid>

                  <Box
                    my={2}
                    width={1}
                    display={"flex"}
                    flexDirection={"column"}
                    style={{ gap: mobile ? "15px" : "none" }}
                  >
                    <Grid size={12}>
                      <Field.CheckBox
                        id="consumidor.buffer/aceptacondiciones"
                        label={
                          <Typography>
                            He leido y acepto la política de{" "}
                            <a
                              href="https://www.almansaentucorazon.es/politica-privacidad/"
                              target="_blank"
                            >
                              privacidad
                            </a>
                          </Typography>
                        }
                        checked={consumidor.buffer.aceptacondiciones}
                      />
                    </Grid>
                    <Grid size={12}>
                      <Field.CheckBox
                        id="consumidor.buffer/aceptacomunicacion"
                        label="Quiero recibir novedades y comunicaciones promocionales de almansaentucorazon"
                        checked={consumidor.buffer.aceptacomunicacion}
                      />
                    </Grid>
                  </Box>

                  <Grid size={mobile ? 12 : 5}>
                    <Field.Password
                      id={"consumidor.buffer/password"}
                      label={t(`${TR_PREFIX}campoPass1`)}
                      fullWidth
                      startAdornment={<Icon>lockrounded</Icon>}
                      error={passwordStatus.pass1Msg}
                      helperText={passwordStatus.pass1Msg}
                    />
                  </Grid>
                  <Grid size={mobile ? 0 : 2} />
                  <Grid size={mobile ? 12 : 5}>
                    <Field.Password
                      id="repeatedPassword"
                      label={t(`${TR_PREFIX}campoPass2`)}
                      fullWidth
                      startAdornment={<Icon>lockrounded</Icon>}
                      error={passwordStatus.pass2Msg}
                      helperText={passwordStatus.pass2Msg}
                    />
                  </Grid>
                </Grid>

                <Grid size={12} className={classes.gridItems}>
                  <Button
                    id="confirmarRegistro"
                    text="Confirmar"
                    variant="text"
                    className={classes.signupButton}
                    disabled={
                      smState === "creando_consumidor" ||
                      !validation(consumidor.buffer) ||
                      !repeatedPassword ||
                      passwordStatus.pass1Msg ||
                      passwordStatus.pass2Msg
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
        {!(smState === "establecer_nuevo_consumidor" || smState === "creando_consumidor") && (
          <Grid size={{ xs: 11, sm: 8, md: 4, lg: 3, xl: 2 }}>
            <Paper>
              {smState === "send_email" && (
                <Grid container direction="column">
                  <Grid size="grow" className={clsx(classes.gridItems, classes.header)}>
                    <Typography className={classes.typography} variant="h5">
                      Regístrate
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Typography className={classes.typography}>
                      Indícanos tu correo electrónico, haz clic en ENVIAR y accede al correo que
                      recibirás para finalizar el registro.
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Field.Text
                      id="email"
                      label="E-mail"
                      fullWidth
                      startAdornment={<Icon>emailrounded</Icon>}
                    />
                  </Grid>
                  <Grid size={12} className={classes.gridItems}>
                    <Button
                      id="enviarCorreo"
                      text="ENVIAR"
                      variant="text"
                      disabled={email === ""}
                      className={classes.signupButton}
                    />
                  </Grid>
                </Grid>
              )}
              {smState === "email_sent" && (
                <Grid container direction="column">
                  <Grid size="grow" className={clsx(classes.gridItems, classes.header)}>
                    <Typography className={classes.typography} variant="h5">
                      ¡Hecho!
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Typography className={classes.typography}>
                      Hemos enviado un correo a {email} con las instrucciones para crear tu usuario
                    </Typography>
                    <Typography className={classes.typographySmall}>
                      {`(Si no recibes el correo en la bandeja de entrada, no olvides consultar la
                      carpeta de correos no deseados o spam)`}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              {smState === "send_email_failed" && (
                <Grid container direction="column">
                  <Grid size="grow" className={clsx(classes.gridItems, classes.header)}>
                    <Typography className={classes.typography} variant="h5">
                      Error
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Typography className={classes.typography}>{error}</Typography>
                  </Grid>
                </Grid>
              )}
              {smState === "hash_incorrecto" && (
                <Grid container direction="column">
                  <Grid size="grow" className={clsx(classes.gridItems, classes.header)}>
                    <Typography className={classes.typography} variant="h5">
                      Error
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Typography className={classes.typography}>
                      {t(`${TR_PREFIX}enlaceIncorrecto`)}
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Button
                      id="aceptarIncorrecto"
                      text={t(`${TR_PREFIX}aceptar`)}
                      variant="text"
                      // color="secondary"
                      onClick={() => dispatch({ type: "onVolverYLimpiar" })}
                      className={classes.signupButton}
                    />
                  </Grid>
                </Grid>
              )}
              {smState === "usuario_creado" && (
                <Grid container direction="column">
                  <Grid size="grow" className={clsx(classes.gridItems, classes.header)}>
                    <Typography className={classes.typography} variant="h5">
                      ¡Hecho!
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Typography className={classes.typography}>
                      {t(`${TR_PREFIX}confirmacionCreacionUsuario`)}
                    </Typography>
                  </Grid>
                  <Grid size="grow" className={classes.gridItems}>
                    <Button
                      id="irALogin"
                      text={t(`${TR_PREFIX}irALogin`)}
                      variant="text"
                      // color="primary"
                      onClick={() => navigate("/")}
                      className={classes.signupButton}
                    />
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Quimera.Template>
  );
}

export default Signup;
