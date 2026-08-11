import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DynamicFilter,
  Field,
  Tab,
  TabWidget,
  Typography,
} from "@quimera/comps";
import {
  Grid,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from "@quimera/thirdparty";
import Quimera, { useStateValue, util } from "quimera";
import { useEffect } from "react";

function DashboardEsqueletos({ useStyles }) {
  const [
    {
      count,
      cargandoDatos,
      cantidadRecepcionada,
      dialogMsg,
      dialogTitle,
      esqueletoSeleccionado,
      esqueletos,
      habilitarRecepcion,
      historico,
      recepcionados,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();

  useEffect(() => {
    dispatch({ type: "onInit" });
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      payload: { nombre: "Recepcionar Esqueletos" },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch]);

  return (
    <Quimera.Template id="DashboardEsqueletos">
      <Backdrop open={cargandoDatos} style={{ zIndex: 999 }}>
        Cargando Esqueletos&nbsp;&nbsp;
        <CircularProgress color="inherit" />
      </Backdrop>
      <Container maxWidth="md" className={classes.container}>
        <Box className={classes.counter} display="flex" width={1} justifyContent="flex-end">
          <strong>Esqueletos mostrados: {count}</strong>
        </Box>
        <br />
        <TabWidget id="tabEsqueletos" tabPanelProps={{ mobile: true }}>
          <Tab title="Sillones">
            {/* <Box flexGrow={1} justifyContent='flex-start'> */}
            <Box display="flex">
              <Box flexGrow={1}>
                <DynamicFilter
                  id="filtroEsqueletos"
                  propiedades={[
                    {
                      tipoCampo: "apiselect",
                      nombreCampo: "referencia",
                      labelNombre: "Referencia",
                      labelChip: "Referencia: ",
                      porDefecto: false,
                      value: { key: "", value: "" },
                      tablaAPI: "articulos",
                      selectAPI: "referencia,descripcion",
                      buscarPor: "referencia",
                      tipo: "normal",
                    },
                    {
                      tipoCampo: "date",
                      nombreCampo: "mx_fechaentrega",
                      labelNombre: "F. Entrega",
                      labelChip: "F. Entrega: ",
                      porDefecto: false,
                      textoDesde: "desde",
                      textoHasta: "hasta",
                      value: { desde: null, hasta: null, fecha: null },
                      opcionesPredefinidas: [
                        { nombre: "", fecha: null, desde: null, hasta: null },
                        { nombre: "Hoy", persistencia: "hoy" },
                        { nombre: "Ayer", persistencia: "ayer" },
                        { nombre: "Esta semana", persistencia: "estasemana" },
                        { nombre: "Hasta ayer", persistencia: "hastaayer" },
                        { nombre: "Este mes", persistencia: "estemes" },
                        { nombre: "Este año", persistencia: "esteanyio" },
                      ],
                      tipo: "normal",
                    },
                  ]}
                />
              </Box>
              <Box ml={2} mt={1} display="flex" justifyContent="flex-end">
                <Field.Switch
                  id="recepcionados"
                  label="Recepcionados"
                  color="primary"
                  onClick={e =>
                    dispatch({ type: "onSwitchClicked", payload: { item: e.target.checked } })
                  }
                />
              </Box>
            </Box>
            <List>
              {esqueletos.map((s, key) => (
                <ListItem key={s.referencia} divider={true} className={classes.element}>
                  <ListItemAvatar>
                    <Grid container justifyContent="center" spacing={1}>
                      <Grid size="grow">
                        <Avatar variant="rounded" className={classes.green}>
                          {recepcionados ? s.canrecepcionada : s.contador}
                        </Avatar>
                      </Grid>
                    </Grid>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography>
                        <strong>{`${s.referencia} - ${s.descripcion}`}</strong>
                      </Typography>
                    }
                    secondary={
                      <Typography>{`F. Entrega: ${util.formatDate(s.mx_fechaentrega)}`}</Typography>
                    }
                  />
                  {
                    <ListItemSecondaryAction>
                      {!recepcionados ? (
                        <IconButton
                          edge="end"
                          aria-label="finalizar"
                          onClick={() =>
                            dispatch({ type: "onRecepcionarClicked", payload: { esqueleto: s } })
                          }
                        >
                          <Icon>done</Icon>
                        </IconButton>
                      ) : (
                        <IconButton
                          edge="end"
                          aria-label="deshacer"
                          onClick={() =>
                            dispatch({ type: "onDeshacerClicked", payload: { esqueleto: s } })
                          }
                        >
                          <Icon>undo</Icon>
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  }
                </ListItem>
              ))}
            </List>
          </Tab>
          <Tab title="Sofás + Sillones especiales" disabled>
            <DynamicFilter
              id="filtroHistorico"
              propiedades={[
                {
                  tipoCampo: "date",
                  nombreCampo: "fechaentrega",
                  labelNombre: "F. Entrega",
                  labelChip: "F. Entrega: ",
                  porDefecto: false,
                  textoDesde: "desde",
                  textoHasta: "hasta",
                  value: { desde: null, hasta: null, fecha: null },
                  opcionesPredefinidas: [
                    { nombre: "", fecha: null, desde: null, hasta: null },
                    { nombre: "Hoy", persistencia: "hoy" },
                    { nombre: "Ayer", persistencia: "ayer" },
                    { nombre: "Esta semana", persistencia: "estasemana" },
                    { nombre: "Hasta ayer", persistencia: "hastaayer" },
                    { nombre: "Este mes", persistencia: "estemes" },
                    { nombre: "Este año", persistencia: "esteanyio" },
                  ],
                  tipo: "normal",
                },
              ]}
            />
            <List>
              {historico.map((s, key) => (
                <ListItem
                  key={`${s.referencia}_${s.fechaentrega}`}
                  divider={true}
                  className={classes.element}
                >
                  <ListItemAvatar>
                    <Grid container justifyContent="center" spacing={1}>
                      <Grid size="grow">
                        <Avatar variant="rounded" className={classes.green}>
                          {s.contador}
                        </Avatar>
                      </Grid>
                    </Grid>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography>
                        <strong>{`${s.referencia} - ${s.descripcion}`}</strong>
                      </Typography>
                    }
                    secondary={
                      <span>
                        <Typography component={"span"}>
                          {util.formatDate(s.fechaentrega)}
                        </Typography>
                      </span>
                    }
                  />
                  {
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="cancelar"
                        onClick={() =>
                          dispatch({ type: "onCancelarEntregaClicked", payload: { esqueleto: s } })
                        }
                      >
                        <Icon>undo</Icon>
                      </IconButton>
                    </ListItemSecondaryAction>
                  }
                </ListItem>
              ))}
            </List>
          </Tab>
        </TabWidget>

        <Dialog open={habilitarRecepcion} maxWidth="md">
          <DialogTitle id="form-dialog-title"> {dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText id="form-dialog-description">{dialogMsg}</DialogContentText>
            <Field.Int
              autoFocus
              margin="dense"
              id="cantidadRecepcionada"
              label="Cantidad"
              fullWidth
            />
            <DialogActions>
              {/* <Button id='confirmarEntrega' text='Confirmar' onClick={() => dispatch({ type: 'onConfirmarEntregaClicked', payload: { cantidad: cantidadEntregada } })}/> */}
              <Button
                id="confirmarRecepcion"
                text="Confirmar"
                data={{ cantidad: cantidadRecepcionada, esqueleto: esqueletoSeleccionado }}
              />
              <Button id="cancelarRecepcion" text="Cancelar" />
            </DialogActions>
          </DialogContent>
        </Dialog>
      </Container>
    </Quimera.Template>
  );
}

export default DashboardEsqueletos;
