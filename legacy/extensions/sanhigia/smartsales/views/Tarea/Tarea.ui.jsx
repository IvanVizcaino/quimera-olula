import { Box, Button, Container, Field, Grid } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@quimera/thirdparty";
import Quimera, { A, getSchemas, navigate, useStateValue, util } from "quimera";
import { useEffect } from "react";

import {
  ButtonContacto,
  EstadoTarea,
  FieldTitle,
  FieldValue,
  MainBox,
  SSQSection,
  TipoTarea,
} from "../../comps";

const useStyles = makeStyles(theme => ({
  enlace: {
    marginLeft: "1em",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    color: theme.palette.primary.main,
  },
}));

function Tarea({ desdeMasterTareas, idTarea, idCampania, tipoTarea, refreshCallback }) {
  const [
    {
      modalFechaHoraFin,
      modalSiguienteTarea,
      modalEstadoTrato,
      noEncontrado,
      tarea,
      tareaBuffer,
      trato,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const schemaTarea = getSchemas()?.tarea;
  const telefono = tarea?.telefonoContacto;
  const email = tarea?.emailContacto;
  const nombre = tarea?.nombreContacto;
  const urlCodContacto = tarea.codContacto ? "contacto" : "clientes";
  const cod = tarea.codContacto || tarea.codCliente || tarea.codClienteIncidencia;
  const urlContacto = `/ss/${urlCodContacto}/${cod}`;
  const historyBack = tipoTarea ? -2 : -1;

  const urlSiguenteTarea = tipo => {
    const url = tarea.idTrato
      ? `/ss/trato/${tarea?.idTrato}/tarea/nueva/${tipo}`
      : tarea.codIncidencia
        ? `/ss/incidencias/${tarea?.codIncidencia}/tarea/nueva/${tipo}`
        : null;

    return url;
  };

  const urlIrATrato = () => {
    const url = idCampania
      ? `/ss/campania/${idCampania}/tratos/${tarea?.idTrato}`
      : `/ss/trato/${tarea?.idTrato}`;

    return url;
  };

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        desdeMasterTareas,
        idTarea,
        tipoTarea,
        refreshCallback,
      },
    });
  }, [idTarea, dispatch]);

  if (noEncontrado) {
    return <Quimera.View id="RegNoEncontrado" />;
  }

  // console.log("mimensaje_TAREA", tarea.codCliente, tarea.codContacto);

  return (
    <Quimera.Template id="Tarea">
      <Container maxWidth="xs">
        <MainBox /*title={tarea?.titulo}*/ title="Tarea" before={true} historyBack={historyBack}>
          <SSQSection
            actionPrefix="cabecera"
            dynamicComp={() => (
              <Field.Schema id="tareaBuffer.titulo" schema={schemaTarea} fullWidth />
            )}
          >
            <Box w={1} display="flex" justifyContent="space-between">
              <FieldTitle>Tarea:</FieldTitle>
              <FieldValue>{tarea?.titulo}</FieldValue>
            </Box>
          </SSQSection>
        </MainBox>
        <MainBox>
          <Box w={1} display="flex" justifyContent="space-between">
            <FieldTitle>Trato:</FieldTitle>
            <A href={urlIrATrato()} className={classes.enlace}>
              <FieldValue>{tarea?.tituloTrato}</FieldValue>
            </A>
          </Box>
          <Box w={1} display="flex" justifyContent="space-between">
            <FieldTitle>{tarea.codContacto ? "Contacto:" : "Cliente:"}</FieldTitle>
            <A href={urlContacto} className={classes.enlace}>
              <FieldValue>{nombre}</FieldValue>
            </A>
            {/* <FieldValue>{nombre}</FieldValue> */}
          </Box>
        </MainBox>

        <MainBox>
          <SSQSection
            actionPrefix="tipo"
            dynamicComp={() => <TipoTarea id="tareaBuffer.tipo" label="Tipo" fullWidth async />}
          >
            <Box w={1} display="flex" justifyContent="space-between">
              <FieldTitle>Tipo:</FieldTitle>
              <FieldValue>{tarea?.tipo}</FieldValue>
            </Box>
          </SSQSection>
        </MainBox>

        <MainBox>
          {tarea.completada ? (
            <Box mx={0.5} mt={1.5} mb={0.5} w={1} display="flex" justifyContent="space-between">
              <FieldTitle>Fecha/Hora:</FieldTitle>
              <FieldValue>
                {`${util.formatDate(tarea?.fecha)} ${tarea.hora.substring(0, 5)}`}
              </FieldValue>
            </Box>
          ) : (
            <SSQSection
              actionPrefix="fecha"
              dynamicComp={() => (
                <>
                  <Field.Schema id="tareaBuffer.fecha" schema={schemaTarea} fullWidth />
                  <Field.Schema id="tareaBuffer.hora" schema={schemaTarea} fullWidth />
                </>
              )}
            >
              <Box w={1} display="flex" justifyContent="space-between">
                <FieldTitle>Fecha/Hora:</FieldTitle>
                <FieldValue>
                  {`${util.formatDate(tarea?.fecha)} ${tarea.hora.substring(0, 5)}`}
                </FieldValue>
              </Box>
            </SSQSection>
          )}
        </MainBox>

        <MainBox
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "stretch",
          }}
        >
          <ButtonContacto
            icon="phone_enabled"
            klass="error"
            disabled={tarea?.tipo !== "Llamada" || !telefono}
            onClick={() => (window.location.href = `tel://+34${telefono}`)}
          />
          <ButtonContacto
            icon="mail"
            klass="success"
            disabled={tarea?.tipo !== "Email" || !email}
            onClick={() => (window.location.href = `mailto:${email}`)}
          />
          <ButtonContacto
            icon="whatsapp"
            klass="success_alt"
            disabled={tarea?.tipo !== "Whatsapp" || !telefono}
            onClick={() => window.open(`https://wa.me/34${telefono}`, "_blank")}
          />
        </MainBox>

        <EstadoTarea
          field="tareaBuffer.completada"
          value={tarea?.completada}
          style={{ margin: "15px 5px", width: "100%", height: "60px" }}
        />

        <MainBox>
          <SSQSection
            actionPrefix="nota"
            dynamicComp={() => (
              <Field.Text id="tareaBuffer.nota" label="Nota" fullWidth multiline />
            )}
          >
            <FieldTitle>Nota:</FieldTitle>
            <Field.Text id="tarea.nota" fullWidth multiline disabled />
            {/* <FieldValue>{tarea?.nota}</FieldValue> */}
          </SSQSection>
        </MainBox>
      </Container>

      <Dialog open={modalSiguienteTarea}>
        <DialogTitle id="form-dialog-title">Generar siguiente tarea</DialogTitle>
        <DialogContent>
          <Box display={"flex"} justifyContent="space-around">
            <ButtonContacto
              icon="phone_enabled"
              klass="error"
              disabled={false}
              onClick={() => navigate(urlSiguenteTarea("llamada"))}
            />
            <ButtonContacto
              icon="mail"
              klass="success"
              disabled={false}
              onClick={() => navigate(urlSiguenteTarea("email"))}
            />
            <ButtonContacto
              icon="whatsapp"
              klass="success_alt"
              disabled={false}
              onClick={() => navigate(urlSiguenteTarea("whatsapp"))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="center">
            <Button
              id="cancelar"
              text="Cancelar"
              variant="text"
              color="secondary"
              onClick={() =>
                dispatch({ type: "onCloseModalSiguienteTarea", payload: { historyBack } })
              }
            />
          </Grid>
        </DialogActions>
      </Dialog>

      <Dialog open={modalEstadoTrato} fullWidth maxWidth="xs">
        <DialogTitle id="form-dialog-title">Cambia el estado del trato de la tarea</DialogTitle>
        <DialogContent>
          <Quimera.View
            id="EstadoTrato"
            tratoProp={trato}
            noMostrarBotonesProp={true}
            refreshCallback={() =>
              dispatch({ type: "cerrarModalEstadoTrato", payload: { historyBack } })
            }
          />
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="center">
            <Button
              id="cancelar"
              text="Cancelar"
              variant="text"
              color="secondary"
              onClick={() => dispatch({ type: "cerrarModalEstadoTrato", payload: { historyBack } })}
            />
          </Grid>
        </DialogActions>
      </Dialog>

      <Dialog open={modalFechaHoraFin} fullWidth maxWidth="xs">
        <DialogTitle id="form-dialog-title">Fecha y hora de finalización</DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={2}>
            <Grid size={12} style={{ marginTop: "1em" }}>
              <Field.Schema id="tareaBuffer.fechaFin" schema={schemaTarea} fullWidth />
            </Grid>
            <Grid size={12}>
              <Field.Schema id="tareaBuffer.horaFin" schema={schemaTarea} fullWidth />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Grid container justifyContent="center">
            <Button
              id="aceptar"
              text="Aceptar"
              variant="text"
              color="primary"
              disabled={!tareaBuffer?.fechaFin || !tareaBuffer?.horaFin}
              onClick={payload => dispatch({ type: "completarTarea", payload })}
            />
          </Grid>
        </DialogActions>
      </Dialog>
    </Quimera.Template>
  );
}

export default Tarea;
