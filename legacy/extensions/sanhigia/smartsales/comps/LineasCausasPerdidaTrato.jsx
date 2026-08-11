import { Box, Grid, Icon, IconButton, Typography } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { useStateValue, util } from "quimera";

const useStyles = makeStyles(theme => ({
  box: {
    width: "100%",
  },
  tarjetaCausa: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "1px solid lightgrey",
    padding: 10,
  },
}));

export default function LineasCausasPerdidaTrato({ lineas, ...props }) {
  const classes = useStyles();
  const [_, dispatch] = useStateValue();

  return (
    <Box className={classes.box}>
      {lineas?.map(linea => (
        <Box my={1} className={classes.tarjetaCausa}>
          <Box
            display="flex"
            // flexGrow={1}
            alignItems="center"
            justifyContent="flex-end"
            mr={1}
          >
            <IconButton
              id="borrarSubtarea"
              size="small"
              onClick={() =>
                util.getSetting("appDispatch")({
                  type: "invocarConfirm",
                  payload: {
                    titulo: "¿Borrar elemento?",
                    textoNo: "CANCELAR",
                    textoSi: "BORRAR",
                    alConfirmar: () =>
                      dispatch({ type: "onBorrarCausaClicked", payload: { linea } }),
                  },
                })
              }
              // disabled={!tengoPermisos}
              tooltip="Borrar este elemento"
            >
              <Icon>delete</Icon>
            </IconButton>
          </Box>
          <Box flexGrow={10} direction="row" alignItems="center">
            <Grid size={12}>
              <Typography
                variant="body1"
                align="left"
                style={{
                  fontSize: "0.95rem",
                }}
              >
                {linea?.descripcion}
              </Typography>
            </Grid>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
