import { ListItemLineaPedido, Totales } from "@quimera-extension/base-area_clientes";
import { Cliente, DirCliente } from "@quimera-extension/base-ventas";
import {
  Box,
  Button,
  Field,
  Grid,
  Icon,
  IconButton,
  QBox,
  QSection,
  Tab,
  TabWidget,
  Typography,
} from "@quimera/comps";
import { Avatar, List, ListItem, ListItemText } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";

import schemas from "../../../static/schemas";

function VentasDetalle({ useStyles }) {
  const [{ lineas, pagos, ventas, ventasBuffer, pagando }, dispatch] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  const venta = ventas.dict[ventas.current] ?? {};

  const tiposPago = {
    estados: [
      { key: "CONT", value: "CONTADO" },
      { key: "TARJ", value: "TARJETA" },
    ],
  };

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;

  return (
    <Quimera.Template id="VentasDetalle">
      {ventasBuffer && (
        <QBox
          width={anchoDetalle}
          titulo={`Venta ${venta.codigo}`}
          botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
        >
          <Box px={0} my={1}>
            <Box width={1} border={0} borderColor="gray" height={"calc(100%)"}>
              <Grid container spacing={0} direction="column">
                <Grid size={12}>
                  <Grid container size={12} justifyContent={venta.cerrada ? "flex-end" : "flex-start"} alignItems="center" style={{
                    height: "60px",
                  }}>
                    {!venta.cerrada && (
                      <Button
                        id="pagarVenta"
                        color="secondary"
                        variant="contained"
                        style={{ maxHeight: "40px" }}
                        text={"Pagar"}
                        disabled={pagando || venta.total === 0}
                      />
                    )}
                    {venta.cerrada && (
                      <IconButton id="imprimirVenta">
                        <Icon fontSize="large">print</Icon>
                      </IconButton>
                    )}
                  </Grid>
                  <QSection
                    title={`Cliente ${venta.codCliente ?? ""}`}
                    actionPrefix="venta"
                    alwaysInactive={venta.cerrada}
                    dynamicComp={() => (
                      <Grid container>
                        <Grid size={12}>
                          <Cliente id="ventasBuffer.codCliente" label="Cliente" fullWidth async />
                        </Grid>
                        <Grid size={12}>
                          <DirCliente
                            id="ventasBuffer.codDir"
                            codCliente={ventasBuffer.codCliente}
                            label="Dirección"
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    )}
                    saveDisabled={() => !ventasBuffer.codCliente || !ventasBuffer.codDir}
                  >
                    <Typography variant="h5">{venta.nombreCliente ?? "Sin cliente"}</Typography>
                  </QSection>
                </Grid>

                <Grid size={12}>
                  <Box display="flex" justifyContent="space-between">
                    <QSection
                      title="Fecha"
                      actionPrefix="venta"
                      alwaysInactive
                      dynamicComp={() => (
                        <Field.Schema
                          id="venta.fecha"
                          schema={schemas.ventas}
                          label=""
                          fullWidth
                          autoFocus
                          disabled
                        />
                      )}
                    >
                      <Box display="flex" alignItems="center">
                        <Icon color="action" fontSize="default" className={classes.leftIcon}>
                          event
                        </Icon>
                        <Typography variant="h5">{util.formatDate(venta.fecha)}</Typography>
                      </Box>
                    </QSection>
                    <Totales
                      totales={[
                        { name: "Pagado", value: venta.pagado },
                        { name: "Restante", value: venta.pendiente },
                        { name: "Neto", value: venta.neto },
                        { name: "Total IVA", value: venta.totalIva },
                        { name: "Total", value: venta.total },
                      ]}
                    />
                  </Box>
                </Grid>

                {!pagando ? (
                  <Grid size={12}>
                    <Box>
                      <TabWidget appBarProps={{ style: { marginTop: "15px" } }}>
                        <Tab title="Líneas" style={{ width: "100%" }}>
                          <List disablePadding>
                            {!venta.cerrada && <Quimera.SubView id="TPV/VentasNuevaLinea" />}
                            {lineas?.idList?.map(idLinea => (
                              <QSection
                                key={idLinea}
                                actionPrefix="linea"
                                readOnly
                                mt={0}
                                p={0}
                                ensureVisible
                                alwaysInactive={idLinea !== lineas.current}
                                focusStyle="listItem"
                                dynamicComp={() => <Quimera.SubView id="TPV/VentasLineas" />}
                              >
                                <ListItemLineaPedido
                                  key={idLinea}
                                  selected={idLinea === lineas.current}
                                  linea={lineas.dict[idLinea]}
                                  onClick={() =>
                                    dispatch({
                                      type: "onLineasClicked",
                                      payload: { item: lineas.dict[idLinea] },
                                    })
                                  }
                                />
                              </QSection>
                            ))}
                            {lineas.idList.length > 5 && !venta.cerrada && (
                              <Quimera.SubView id="TPV/VentasNuevaLinea" />
                            )}
                          </List>
                        </Tab>
                        <Tab title="Pagos" style={{ width: "100%" }}>
                          <List>
                            {pagos?.idList?.map(pago => (
                              <ListItem key={pago} className={classes.card} disableGutters>
                                <Avatar className={classes.avatar}>{pago}</Avatar>
                                <ListItemText
                                  primary={
                                    <Box
                                      width={1}
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                    >
                                      <Box display="inline">
                                        <Box mr={1} display="inline">
                                          {Object.entries(tiposPago.estados).map(valor => {
                                            if (valor[1].key === pagos.dict[pago].formaPago) {
                                              return valor[1].value;
                                            }
                                          })}
                                        </Box>
                                        <Box display="inline">
                                          {`${util.euros(pagos.dict[pago].importe)}`}
                                        </Box>
                                      </Box>
                                      {!ventas.dict[ventas.current].cerrada && (
                                        <Box mr={1} display="inline">
                                          <Button
                                            id="eliminarPago"
                                            text={<Icon>delete</Icon>}
                                            onClick={() =>
                                              dispatch({
                                                type: "onEliminarPagoClicked",
                                                payload: { id: pago },
                                              })
                                            }
                                          />
                                        </Box>
                                      )}
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Tab>
                      </TabWidget>
                    </Box>
                  </Grid>
                ) : (
                  <Grid size={12}>
                    <Quimera.SubView id="TPV/VentasPagos" />
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        </QBox>
      )}
    </Quimera.Template>
  );
}

export default VentasDetalle;
