import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Field,
  Grid,
  Icon,
  IconButton,
  QBox,
  Typography,
} from "@quimera/comps";
import { List } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth } from "quimera";

import { ListItemArqueo } from "../../../comps";

function ArqueosMaster() {
  const [{ arqueos, abrirDialogoImporteInicial, arqueoAbierto }, dispatch] = useStateValue();

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;

  const botones = [
    {
      id: "nuevoArqueo",
      icon: "add_circle",
      text: "Nuevo arqueo",
      disabled: arqueoAbierto,
    },
  ];

  return (
    <Quimera.Template id="ArqueosMaster">
      <Box width={anchoDetalle}>
        <Dialog open={abrirDialogoImporteInicial} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Grid container alignItems="center" justifyContent="space-between">
              IMPORTE INICIAL
              <IconButton
                id="cerrar"
                size="small"
                alt="Cerrar"
                onClick={() => dispatch({ type: "onCerrarImporteInicial", payload: {} })}
              >
                <Icon title="Cerrar">close</Icon>
              </IconButton>
            </Grid>
          </DialogTitle>
          <DialogContent dividers={true}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography>Introduce el importe inicial de la caja: </Typography>
              <Field.Currency id="importeInicial" />
            </Box>
            <Box display="flex" justifyContent="flex-end">
              <Button
                id="crearArqueo"
                color="primary"
                size="large"
                fullWidth
                variant="contained"
                text="Crear Arqueo"
              />
            </Box>
          </DialogContent>
        </Dialog>
        <QBox titulo="Arqueos" botones={botones}>
          <List>
            {arqueos.idList
              .map(item => item)
              .reverse()
              .map(arqueo => (
                <ListItemArqueo
                  key={arqueo}
                  selected={arqueo === arqueos.current}
                  divider
                  arqueo={arqueos.dict[arqueo]}
                  onClick={() =>
                    dispatch({ type: "onArqueosClicked", payload: { item: arqueos.dict[arqueo] } })
                  }
                />
              ))}
          </List>
        </QBox>
      </Box>
    </Quimera.Template>
  );
}

export default ArqueosMaster;
