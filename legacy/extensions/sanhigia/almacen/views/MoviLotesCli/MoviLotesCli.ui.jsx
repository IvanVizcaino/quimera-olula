import {
  Box,
  Button,
  Column,
  Container,
  Dialog,
  Field,
  Icon,
  IconButton,
  Table,
  Typography,
} from "@quimera/comps";
import Quimera, { useStateValue, useWidth } from "quimera";
import { useEffect } from "react";

import { ModaLotesLinea } from "../../comps";

function MoviLotesCli({ idLineaPC, idPedido, codPreparacionDePedido, useStyles }) {
  const [{ movilotes, modalLotesAlmacenVisible, linea }, dispatch] = useStateValue();
  const classes = useStyles();

  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        idLineaPC: idLineaPC ? parseInt(idLineaPC) : "",
        idPedido,
        codPreparacionDePedido,
      },
    });
  }, [dispatch]);

  // useEffect(() => {
  //   dispatch({
  //     type: "onIdLineaPCProp",
  //     payload: { idLineaPC: idLineaPC ? parseInt(idLineaPC) : "" },
  //   });
  // }, [idLineaPC]);

  const width = useWidth();

  const mobile = ["xs", "sm"].includes(width);
  const desktop = !mobile;
  const disabled = false;
  const lineaPedido = linea.dict[linea.idList[0]];
  let mensaje = "";
  let descripcion = "";
  if (lineaPedido) {
    mensaje = `Esperada: ${lineaPedido.cantidad} Servida: ${lineaPedido.shCantAlbaran} En Albaran ${lineaPedido.totalEnAlbaran}`;
    descripcion = lineaPedido.descripcion;
  }

  const onKeyPressed = (event, linea) => {
    event.key === "Enter" &&
      dispatch({
        type: "onCantidadLoteCambiada",
        payload: { nuevaCantidadMovilote: event.target.value, idLote: linea.id },
      });
  };

  return (
    <Quimera.Template id="MoviLotes">
      <Container className={classes.container} disableGutters={width === "xs" || width === "sm"}>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h6" className={classes.loteTitle}>
            {descripcion}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h12">{mensaje}</Typography>
        </Box>
        <Box id="Caja filtro" width={0.95} mb={2} ml={1} display="flex" justifyContent="space-between">
          <Button
            id="volverLotes"
            text="Volver"
            variant="outlined"
            color="primary"
            onClick={() =>
              dispatch({ type: "onVolverLoteClicked", payload: { idLinea: idLineaPC } })
            }
          />
          <Button
            id="anadirLote"
            text="Añadir lote"
            variant="contained"
            color="primary"
            onClick={() =>
              dispatch({ type: "onAnadirLoteClicked", payload: { idLinea: idLineaPC } })
            }
          />
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          className={classes.lotesTable}
        >
          <Table
            id="tdbMoviLotes"
            idField="id"
            data={Object.values(movilotes.dict)}
            clickMode="line"
            orderColumn="codigo"
          >
            <Column.Text
              id="codigo"
              header="Código"
              order="codigo"
              pl={2}
              value={movilote => movilote.codigo}
              width={220}
            />
            <Column.Action
              id="cantidad"
              className={classes.numberColumnEditable}
              header="Cantidad"
              align="right"
              width={80}
              value={(linea, idx) => (
                <>
                  <Field.Float
                    id={`cantidad/${idx}`}
                    field="cantidad"
                    value={Math.abs(linea.cantidad) ?? 0.0}
                    index={idx}
                    allowNegative={false}
                    onClick={event => event.target.select()}
                    onKeyPress={event => onKeyPressed(event, linea)}
                  // error={validacionLineasDevolucion?.[idx]?.cantidadKo?.error}
                  // helperText={validacionLineasDevolucion?.[idx]?.cantidadKo?.message ?? ""}
                  // disabled={esComercial}
                  />
                </>
              )}
            />
            <Column.Date
              id="caducidad"
              header="Caducidad"
              order="caducidad"
              value={movilote => movilote.caducidad}
              width={100}
            />
            <Column.Decimal
              id="dispLotesAlmacen"
              header="Disponible"
              order="dispLotesAlmacen"
              value={movilote => movilote.dispLotesAlmacen}
              width={90}
            />

            <Column.Action
              id="borrarMoviloteCLi"
              value={movilote => (
                <IconButton
                  id="BorrarMoviloteCliButton"
                  size="small"
                  tooltip="Borrar movilote"
                  onClick={() =>
                    dispatch({
                      type: "onBorrarMoviloteCliClick",
                      payload: { idLote: movilote.id, idLinea: idLineaPC },
                    })
                  }
                >
                  <Icon>delete</Icon>
                </IconButton>
              )}
            />
          </Table>
        </Box>
      </Container>
      <Dialog
        open={modalLotesAlmacenVisible}
        fullWidth
        maxWidth="md"
        fullScreen={width === "xs" || width === "sm"}
        onClose={() => dispatch({ type: "onCerrarModalLotesAlmacen" })}
      >
        <ModaLotesLinea key="ModaLotesLinea" disabled={false} dispatch={dispatch} />
      </Dialog>
    </Quimera.Template>
  );
}

export default MoviLotesCli;
