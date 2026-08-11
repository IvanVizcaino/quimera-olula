import {
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  IconButton,
  Typography,
} from "@quimera/comps";
import Quimera, { useStateValue, useWidth, util } from "quimera";
import { useEffect } from "react";

function InformeClientesComparativa({ idClienteProp, useStyles }) {
  const [{ idCliente }, dispatch] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  useEffect(() => {
    dispatch({ type: "init", payload: { idClienteProp } });
  }, [dispatch, idClienteProp]);

  useEffect(() => {
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      // payload: { nombre: `${idCliente ? "Comparativa artículos" : "Comparativa clientes"}` },
      payload: { nombre: "Comparativa clientes" },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch, idCliente]);

  return (
    <Quimera.Template id="InformeClientesComparativa">
      <Container className={classes.container} disableGutters={width === "xs" || width === "sm"}>
        <Box>
          <Quimera.SubView id="InformeClientesComparativa/ComparativaClientes" />
        </Box>
        <Dialog
          open={!!idCliente}
          maxWidth="lg"
          fullWidth
          disableScrollLock
          onClose={() => dispatch({ type: "onCerrarComparativaArticulos" })}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">Comparativa artículos</Typography>
              <IconButton
                id="cerrarComparativaArticulos"
                size="small"
                onClick={() => dispatch({ type: "onCerrarComparativaArticulos" })}
              >
                <Icon>close</Icon>
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Quimera.SubView id="InformeClientesComparativa/ComparativaArticulos" />
          </DialogContent>
        </Dialog>
      </Container>
    </Quimera.Template>
  );
}

export default InformeClientesComparativa;
