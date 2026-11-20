import { Box, Button, Grid, Typography } from "@quimera/comps";
import { CircularProgress, DragDropContext } from "@quimera/thirdparty";
import Quimera, { useStateValue } from "quimera";
import { useEffect } from "react";

function EnviarDocumentoEmail({
  opcionesDocProp,
  idDocProp,
  codClienteProp,
  codigoParteProp,
  callbackCerradoProp,
  callbackEnviadoProp,
  useStyles,
}) {
  const [{ dirTO, enviando, opcionesEnvio }, dispatch] = useStateValue();
  // const _c = useStyles()
  const classes = useStyles();

  useEffect(() => {
    // console.log("onInitStockChanged useffecting", initStock);
    dispatch({
      type: "onInit",
      payload: {
        opcionesDocProp,
        idDocProp,
        codClienteProp,
        codigoParteProp,
        callbackCerradoProp,
        callbackEnviadoProp,
      },
    });
  }, [idDocProp]);

  return (
    <Quimera.Template id="EnviarDocumentoEmail">
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        minHeight={"75vh"}
      >
        <DragDropContext
          onDragEnd={result =>
            dispatch({
              type: "handleDragEnd",
              payload: { result },
            })
          }
          onDragStart={result => dispatch({ type: "handleDragStart", payload: { result } })}
        >
          <Grid container direction="row" spacing={2}>
            <Grid size={6}>
              <Box>
                <Quimera.SubView id="EnviarDocumentoEmail/EmailsDisponibles" />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box mb={1}>
                <Typography variant="h6" align="center">
                  Listas de remitentes:
                </Typography>
              </Box>
              <Box>
                <Quimera.SubView id="EnviarDocumentoEmail/CajaEnvio" tipoEnvio="TO" />
              </Box>
              <Box>
                <Quimera.SubView id="EnviarDocumentoEmail/CajaEnvio" tipoEnvio="CC" />
              </Box>
              <Box>
                <Quimera.SubView id="EnviarDocumentoEmail/CajaEnvio" tipoEnvio="BCC" />
              </Box>
            </Grid>
          </Grid>
        </DragDropContext>
      </Box>
      <Box mt={2} mx={2} display={"flex"} justifyContent={"space-around"}>
        <Button id="cancelarEnviarEmail" text="Cancelar" color="primary" variant="text" />
        {enviando ? (
          <Box className={classes.textoEnviando}>
            <CircularProgress size={25} color="secondary" />
          </Box>
        ) : (
          <>
            {opcionesEnvio &&
              Object.values(opcionesEnvio)?.map((opcion, index) => (
                <Button
                  id="enviarEmail"
                  key={index}
                  text={opcion?.textoBoton ?? "Enviar"}
                  color="secondary"
                  variant="text"
                  disabled={!dirTO.length}
                  onClick={() =>
                    dispatch({ type: "onEnviarEmailClicked", payload: { tipo: opcion.tipo } })
                  }
                />
              ))}
          </>
        )}
      </Box>
    </Quimera.Template>
  );
}

export default EnviarDocumentoEmail;
