import { Totales } from "@quimera-extension/base-area_clientes";
import { Box, DeleteButton, Field, Grid, Icon, QSection, Typography } from "@quimera/comps";
import Quimera, { useStateValue, util } from "quimera";

import { TpvArticulo } from "../../../comps";
import schemas from "../../../static/schemas";

function VentasLineas({ useStyles }) {
  const [{ ventas, lineas, lineasBuffer }] = useStateValue();

  const venta = ventas.dict[ventas.current];
  const linea = lineas.dict[lineas.current];
  const classes = useStyles();

  return (
    <Quimera.Template id="VentasLineas">
      <Grid container spacing={2}>
        <Grid size={12}>
          <QSection
            title="Artículo"
            actionPrefix="lineaArticulo"
            alwaysInactive={venta.cerrada}
            dynamicComp={() => (
              <Grid container spacing={1} direction="column" >
                <Grid size={12}>
                  <TpvArticulo id="lineasBuffer.referencia" label="Artículo" fullWidth />
                </Grid>
                <Grid size={12}>
                  <Field.Schema id="lineasBuffer.descripcion" schema={schemas.lineas} fullWidth />
                </Grid>
              </Grid>
            )}
            saveDisabled={() => !lineasBuffer.referencia || !lineasBuffer.descripcion}
          >
            <Typography variant="subtitle1">{linea.referencia}</Typography>
            <Typography variant="h6">{linea.descripcion}</Typography>
          </QSection>
        </Grid>

        <Grid size={6}>
          <Field.Schema
            id="lineasBuffer.cantidad"
            schema={schemas.lineas}
            fullWidth
            disabled={venta.cerrada}
          />
        </Grid>
        <Grid size={6}>
          <Field.Schema
            id="lineasBuffer.pvpUnitario"
            schema={schemas.lineas}
            fullWidth
            disabled={venta.cerrada}
          />
        </Grid>

        <Grid size={12}>
          <Totales
            totales={[
              { name: "SubTotal", value: linea.pvpSinDto },
              { name: "Total Dto.", value: linea.pvpSinDto - linea.pvpTotal },
              { name: "Total", value: linea.pvpTotal },
            ]}
          />
        </Grid>

        <Grid size={6}>
          <QSection
            title="Descuentos"
            actionPrefix="lineaDescuento"
            alwaysInactive={venta.cerrada}
            dynamicComp={() => (
              <Grid container spacing={1} direction="column" >
                <Grid size={6}>
                  <Field.Schema id="lineasBuffer.dtoLineal" schema={schemas.lineas} fullWidth />
                </Grid>
                <Grid size={6}>
                  <Field.Schema id="lineasBuffer.dtoPor" schema={schemas.lineas} fullWidth />
                </Grid>
              </Grid>
            )}
          >
            {!!linea.dtoLineal && (
              <Typography variant="subtitle1">Lineal {util.euros(linea.dtoLineal)}</Typography>
            )}
            {!!linea.dtoPor && (
              <Typography variant="subtitle1">Porcentual {linea.dtoPor}%</Typography>
            )}
            {!linea.dtoLineal && !linea.dtoPor && (
              <Typography variant="subtitle1">Sin descuentos</Typography>
            )}
          </QSection>
        </Grid>

        <Grid size={6}>
          <QSection
            title="Impuestos"
            actionPrefix="lineaImpuesto"
            alwaysInactive={venta.cerrada}
            dynamicComp={() => (
              <Grid container spacing={1} direction="column" >
                <Grid size={6}>
                  <Field.Schema id="lineasBuffer.codImpuesto" schema={schemas.lineas} fullWidth />
                </Grid>
                <Grid size={6}>
                  <Field.Schema id="lineasBuffer.iva" schema={schemas.lineas} fullWidth />
                </Grid>
                <Grid size={6}>
                  <Field.Schema id="lineasBuffer.recargo" schema={schemas.lineas} fullWidth />
                </Grid>
                <Grid size={6}>
                  <Field.Schema id="lineasBuffer.irpf" schema={schemas.lineas} fullWidth />
                </Grid>
              </Grid>
            )}
            saveDisabled={() => !lineasBuffer.codImpuesto}
          >
            {!!linea.codImpuesto && (
              <Typography variant="subtitle1">
                IVA {linea.codImpuesto} {linea.iva ?? 0}%
              </Typography>
            )}
            {!!linea.recargo && (
              <Typography variant="subtitle1">Recargo de Equivalencia {linea.recargo}%</Typography>
            )}
            {!!linea.irpf && <Typography variant="subtitle1">IRPF {linea.irpf}%</Typography>}
          </QSection>
        </Grid>

        {!venta.cerrada && (
          <Grid container size={12} justifyContent="center">
            <Grid size={4}>
              <QSection
                actionPrefix="eliminarLinea"
                title="Eliminar línea"
                focusStyle="button"
                dynamicComp={() => (
                  <Box display="flex" flexDirection="column" p={1}>
                    <Typography variant="subtitle2" className={classes.deleteText}>
                      Se va a eliminar la línea.
                    </Typography>
                    <Typography variant="subtitle2">¿Desea continuar?</Typography>
                  </Box>
                )}
                cancel={{
                  className: classes.deleteCancelButton,
                }}
                save={{
                  icon: <Icon>delete</Icon>,
                  text: "Eliminar",
                  className: classes.deleteText,
                }}
              >
                <Box display="flex" justifyContent="center" p={1}>
                  <DeleteButton variant="outlined" />
                </Box>
              </QSection>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Quimera.Template>
  );
}

export default VentasLineas;
