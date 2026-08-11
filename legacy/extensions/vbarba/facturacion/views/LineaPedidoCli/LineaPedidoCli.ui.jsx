import { QProveedor } from "@quimera-extension/base-almacen";
import { Totales } from "@quimera-extension/base-area_clientes";
import {
  Box,
  Button,
  Collapse,
  Field,
  Grid,
  Icon,
  LinearProgress,
  QSection,
  Typography,
} from "@quimera/comps";
import Quimera, { getSchemas, useStateValue, util } from "quimera";
import { useEffect } from "react";
import { QArticuloVbarba } from "../../comps";

function LineaPedidoCli({ callbackGuardada, disabled, lineaInicial, useStyles }) {
  const [{ linea, sections }, dispatch] = useStateValue();
  const classes = useStyles();
  const schema = getSchemas().lineasPedidosCli;
  const { buffer } = linea;

  useEffect(() => {
    util.publishEvent(linea.event, callbackGuardada);
  }, [linea.event.serial]);

  useEffect(() => {
    dispatch({
      type: "onInitLinea",
      payload: {
        initLinea: lineaInicial,
      },
    });
  }, [lineaInicial]);

  return (
    <Quimera.Template id="LineaPedidoCli">
      {linea.buffer._status === "deleting" && (
        <Box width={1}>
          <Typography variant="body2">Borrando línea...</Typography>
          <LinearProgress />
        </Box>
      )}
      <Collapse in={linea.buffer._status !== "deleting"}>
        <Grid container spacing={0} direction="column">
          <Grid size={12}>
            <Box display="flex" justifyContent="right" mt={1}>
              {!disabled && (
                <Button
                  id="deleteLinea"
                  text="Borrar"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon>delete</Icon>}
                  onClick={() =>
                    dispatch({ type: "onDeleteLineaClicked", payload: { item: linea.buffer } })
                  }
                />
              )}
            </Box>
          </Grid>

          <Grid size={12}>
            <QSection
              title={buffer.referencia}
              actionPrefix="linea/articulo"
              alwaysInactive={disabled}
              dynamicComp={() => (
                <Grid container spacing={1} direction="column" >
                  <Grid size={12}>
                    <QArticuloVbarba
                      id="linea.buffer/referencia"
                      label="Artículo"
                      boxStyle={classes.referencia}
                      seVende
                      fullWidth
                    />
                  </Grid>
                  <Grid size={12}>
                    <Field.Schema id="linea.buffer/descripcion" schema={schema} fullWidth />
                  </Grid>
                  <Grid size={12}>
                    <Quimera.Block id="afterDescripcion" />
                  </Grid>
                  <Grid size={12}>
                    <QProveedor
                      id="linea.buffer/codProveedor"
                      label={`Proveedor`}
                      disableClearable
                      fullWidth
                    />
                  </Grid>
                </Grid>
              )}
              saveDisabled={() => !schema.isValid(buffer)}
            >
              <Typography variant="h6">{buffer.descripcion}</Typography>
              {buffer.nombreProveedor && <Typography variant="h6">Proveedor: {buffer.nombreProveedor}</Typography>}
            </QSection>
          </Grid>

          <Grid size={12}>
            <QSection
              actionPrefix="linea/cantidad"
              alwaysInactive={disabled}
              dynamicComp={() => (
                <Grid container spacing={1} direction="column" >
                  <Grid size={6}>
                    <Field.Schema id="linea.buffer/cantidad" schema={schema} fullWidth autoFocus />
                  </Grid>
                  <Grid size={6}>
                    {linea.data.aplicarPvpParticular
                      ? <Field.Schema id="linea.buffer/pvpUnitario" schema={schema} fullWidth />
                      : <Field.Schema id="linea.buffer/pvpReferencia" schema={schema} fullWidth />}
                  </Grid>
                </Grid>
              )}
              saveDisabled={() => !schema.isValid(buffer)}
            >
              <Typography variant="h6" align="right">{`${util.formatter(
                buffer.cantidad,
                2,
              )} x ${util.euros(linea.data.aplicarPvpParticular ? buffer.pvpUnitario : buffer.pvpReferencia)}`}</Typography>
            </QSection>
          </Grid>

          <Grid size={12}>
            <QSection actionPrefix="totales" alwaysInactive>
              <Totales
                totales={[
                  { name: "SubTotal", value: buffer.pvpSinDto },
                  { name: "Total Dto.", value: buffer.pvpSinDto - buffer.pvpTotal },
                  { name: "Total", value: buffer.pvpTotal },
                ]}
              />
            </QSection>
          </Grid>

          <Grid container size={{ xs: 12 }} spacing={1}>
            <Grid size={{ xs: 6 }}>
              <QSection
                title="Descuentos"
                actionPrefix="linea/descuentos"
                alwaysInactive={disabled}
                dynamicComp={() => (
                  <Grid container spacing={1} direction="column" >
                    <Grid size={6}>
                      <Field.Schema id="linea.buffer/dtoLineal" schema={schema} fullWidth />
                    </Grid>
                    <Grid size={6}>
                      <Field.Schema id="linea.buffer/dtoPor" schema={schema} fullWidth />
                    </Grid>
                  </Grid>
                )}
                saveDisabled={() => !schema.isValid(buffer)}
              >
                {!!buffer.dtoLineal && (
                  <Typography variant="subtitle1">Lineal {util.euros(buffer.dtoLineal)}</Typography>
                )}
                {!!buffer.dtoPor && (
                  <Typography variant="subtitle1">Porcentual {buffer.dtoPor}%</Typography>
                )}
                {!buffer.dtoLineal && !buffer.dtoPor && (
                  <Typography variant="subtitle1">Sin descuentos</Typography>
                )}
              </QSection>
            </Grid>

            <Grid size={6}>
              <QSection
                title="Impuestos"
                actionPrefix="linea/Impuestos"
                alwaysInactive={true}
                dynamicComp={() => (
                  <Grid container spacing={1} direction="column" >
                    <Grid size={6}>
                      <Field.Schema id="linea.buffer/codImpuesto" schema={schema} fullWidth />
                    </Grid>
                    <Grid size={6}>
                      <Field.Schema id="linea.buffer/iva" schema={schema} fullWidth />
                    </Grid>
                    <Grid size={6}>
                      <Field.Schema id="linea.buffer/recargo" schema={schema} fullWidth />
                    </Grid>
                    <Grid size={6}>
                      <Field.Schema id="linea.buffer/irpf" schema={schema} fullWidth />
                    </Grid>
                  </Grid>
                )}
                saveDisabled={() => !schema.isValid(buffer)}
              >
                {!!buffer.iva && (
                  <Typography variant="subtitle1">
                    IVA {buffer.codImpuesto} {buffer.iva}%
                  </Typography>
                )}
                {!!buffer.recargo && (
                  <Typography variant="subtitle1">
                    Recargo de Equivalencia {buffer.recargo}%
                  </Typography>
                )}
                {!!buffer.irpf && <Typography variant="subtitle1">IRPF {buffer.irpf}%</Typography>}
              </QSection>
            </Grid>
          </Grid>
        </Grid>
      </Collapse>
    </Quimera.Template>
  );
}

export default LineaPedidoCli;
