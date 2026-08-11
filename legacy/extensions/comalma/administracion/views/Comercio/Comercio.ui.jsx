// import {
//   Box,
//   Button,
//   QBox,
//   QBoxButton,
//   QListModel,
//   Grid
// } from "@quimera/comps";
import { SelectorValores } from "@quimera-extension/base-almacen";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Field,
  Grid,
  Icon,
  QBox,
  QBoxButton,
  QModelBox,
  QSection,
  Typography,
} from "@quimera/comps";
import { useTranslation } from "@quimera/thirdparty";
import Quimera, { getSchemas, useStateValue, useWidth, util } from "quimera";
import { useEffect, useState } from "react";

function Comercio({ callbackChanged, idComercio, initComercio, useStyles }) {
  const [{ comercio, modalCambiarPassword, nuevoPassword, repeatedPassword }, dispatch] =
    useStateValue();
  const [passwordStatus, setPasswordStatus] = useState({ ok: false });
  const classes = useStyles();
  const width = useWidth();
  const { t } = useTranslation();

  useEffect(() => {
    util.publishEvent(comercio.event, callbackChanged);
  }, [comercio.event.serial]);

  useEffect(() => {
    !!initComercio &&
      dispatch({
        type: "onInitComercio",
        payload: {
          initComercio,
          callbackChanged,
        },
      });
    !initComercio &&
      !!idComercio &&
      dispatch({
        type: "onInitComercioById",
        payload: {
          idComercio,
          callbackChanged,
        },
      });
  }, [initComercio, idComercio]);

  useEffect(() => {
    setPasswordStatus(passwordsOK(nuevoPassword, repeatedPassword));
  }, [nuevoPassword, repeatedPassword]);

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const schema = getSchemas().comercios;
  const editable = true;
  const tiposComercio = [
    { key: "Restauracion", value: "Restauración" },
    { key: "Comercio", value: "Comercio" },
  ];
  const miTipoCom = tiposComercio.filter(tp => tp.key === comercio.data.tipo)[0];

  if ((!initComercio && !idComercio) || initComercio?._status === "deleted") {
    return null;
  }

  if (idComercio && !comercio.data.idComercio) {
    return null;
  }

  const MIN_PASS_LENGTH = 6;
  const TR_PREFIX = "login.forgotPassword.";

  function passwordOK(pass) {
    return pass && pass !== "" && pass.length >= MIN_PASS_LENGTH;
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
        util.translate(`${TR_PREFIX}formatoPasswordIncorrecto`, {
          minLength: MIN_PASS_LENGTH,
        });
    }
    if (!passwordOK(pass2)) {
      result.ok = false;
      result.pass2Msg =
        pass2 &&
        util.translate(`${TR_PREFIX}formatoPasswordIncorrecto`, {
          minLength: MIN_PASS_LENGTH,
        });
    }
    if (!result.ok) {
      return result;
    }
    if (pass1 !== pass2) {
      result.ok = false;
      result.pass2Msg = util.translate(`${TR_PREFIX}passwordsDistintas`);
    }

    return result;
  }

  return (
    <Quimera.Template id="Comercio">
      {comercio && (
        <QBox
          width={anchoDetalle}
          titulo={`Establecimiento ${comercio.data.nombre}`}
          botonesCabecera={[
            // { icon: "more_horiz", id: "mas", text: "Más" },
            { icon: "arrow_back", id: "atras", text: "Atrás" },
          ]}
          sideButtons={
            <>
              <QBoxButton
                id="deleteComercio"
                title="Borrar comercio"
                icon="delete"
                disabled={false}
              />
              <QBoxButton
                id="cambiarPassword"
                title="Cambiar contraseña"
                icon="password"
                disabled={false}
              />
            </>
          }
        >
          <Grid container>
            <QModelBox id="comercio.buffer" disabled={!editable} schema={schema}>
              <Grid size={{ xs: 12, sm: 12, md: 12 }} * justifyContent="center">
                <QSection
                  title="Nombre"
                  actionPrefix="comercio.buffer/idComercio"
                  alwaysInactive={!editable}
                  dynamicComp={() => (
                    <Box width={1}>
                      <Field.Text
                        id="comercio.buffer.nombre"
                        label=""
                        fullWidth
                        autoComplete="off"
                        onClick={event => event.target.select()}
                      />
                    </Box>
                  )}
                >
                  <Box display="flex">
                    <Typography variant="body1">{comercio.data.nombre || "Sin Nombre"}</Typography>
                  </Box>
                </QSection>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 12 }} * justifyContent="center">
                <QSection
                  title="Email"
                  actionPrefix="comercio.buffer/idComercio"
                  alwaysInactive={!editable}
                  dynamicComp={() => (
                    <Box width={0.45}>
                      <Field.Text
                        id="comercio.buffer.email"
                        label=""
                        fullWidth
                        autoComplete="off"
                        onClick={event => event.target.select()}
                      />
                    </Box>
                  )}
                >
                  <Box display="flex">
                    <Typography variant="body1">{comercio.data.email || "Sin Email"}</Typography>
                  </Box>
                </QSection>
              </Grid>
              <Grid container size={{ xs: 12, sm: 12, md: 12 }} justifyContent="space-between">
                <Box width={0.45}>
                  <QSection
                    title="Tipo"
                    actionPrefix="comercio.buffer/tipo"
                    alwaysInactive={!editable}
                    dynamicComp={() => (
                      <Box width={1}>
                        <SelectorValores
                          id="tipoComercio"
                          valores={tiposComercio}
                          value={comercio.buffer.tipo}
                          arrayKeyValue
                          fullWidth
                        ></SelectorValores>
                      </Box>
                    )}
                  >
                    <Box display="flex">
                      <Typography variant="body1">{miTipoCom?.value || "Sin tipo"}</Typography>
                    </Box>
                  </QSection>
                </Box>
                <Box width={0.5}>
                  <QSection
                    title="Cif/Nif"
                    actionPrefix="comercio.buffer/cifnif"
                    alwaysInactive={!editable}
                    dynamicComp={() => (
                      <Box width={1}>
                        <Field.Text
                          id="comercio.buffer.cifnif"
                          label=""
                          fullWidth
                          autoComplete="off"
                          onClick={event => event.target.select()}
                        />
                      </Box>
                    )}
                  >
                    <Box display="flex">
                      <Typography variant="body1">
                        {comercio.data.cifnif || "Sin cif/nif"}
                      </Typography>
                    </Box>
                  </QSection>
                </Box>
              </Grid>
              <Grid container size={{ xs: 12, sm: 12, md: 12 }} justifyContent="flex-end">
                <Box mt={6}>
                  <Button
                    id="verVentasComercio"
                    text={"Ver ventas"}
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      dispatch({
                        type: "onVerVentasComercioClicked",
                        payload: { idComercio: comercio.data.idComercio },
                      });
                    }}
                    startIcon={<Icon>shopping_basket</Icon>}
                  />
                </Box>
              </Grid>
            </QModelBox>
          </Grid >
  {/* <Box>
            <Grid container spacing={1} direction="column" >
              <Grid size={{ xs: 6, sm: 6, md: 3, lg: 2 }}>
                <Box component="div" className={classes.mediaContainer}>
                  <div className={classes.mediaContainerTitle}>Tipo</div>
                  <div className={classes.mediaContainerValue}> {comercio.data.tipo}</div>
                </Box>
              </Grid>
            </Grid>
          </Box> */}
  {/* <Box mt={6}>
            <Box width={1} display="flex" justifyContent="flex-end" mt={1}>
              <Button
                id="irACampanasComercio"
                text={"Gestionar Establecimientos"}
                variant="outlined"
                color="primary"
                onClick={() => {
                  dispatch({
                    type: "irACampanasComercio",
                    payload: { idComercio: comercio.data.idComercio },
                  });
                }}
              // startIcon={<Icon>{editable ? "arrow_circle_down" : "arrow_circle_up"}</Icon>}
              />
            </Box>
            <QListModel
              data={campanas}
              title="Campañas"
              modelName="campanas"
              ItemComponent={ListItemCampana}
              itemProps={{
                variant: "section",
              }}
              disabled={false}
            />
          </Box> */}
  <Dialog open={modalCambiarPassword} maxWidth="xs">
    <DialogTitle id="form-dialog-title">Cambiar contraseña</DialogTitle>
    <DialogContent>
      {/* <DialogContentText id="form-dialog-description">AAAAAAAA</DialogContentText> */}
      <Grid container>
        <Grid size={12}>
          <Field.Password
            id={"nuevoPassword"}
            label={t(`${TR_PREFIX}campoPass1`)}
            fullWidth
            startAdornment={<Icon>lockrounded</Icon>}
            error={passwordStatus.pass1Msg}
            helperText={passwordStatus.pass1Msg}
          />
        </Grid>
        {/* <Grid size={mobile ? 0 : 2} /> */}
        <Grid size={12}>
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
      <DialogActions>
        <Button id="cancelarCambioPassword" text="Cancelar" color="primary" />
        <Button
          id="confirmarCambioPassword"
          text="Confirmar"
          variant="text"
          color="primary"
          disabled={
            !nuevoPassword ||
            !repeatedPassword ||
            passwordStatus.pass1Msg ||
            passwordStatus.pass2Msg
          }
        />
      </DialogActions>
    </DialogContent>
  </Dialog>
        </QBox >
      )
}
    </Quimera.Template >
  );
}

export default Comercio;
