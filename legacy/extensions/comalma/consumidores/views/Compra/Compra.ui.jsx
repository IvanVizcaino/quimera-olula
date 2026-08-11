import { Box, Field, Grid, QBox, QModelBox, QSection, Typography } from "@quimera/comps";
import Quimera, { getSchemas, PropValidation, useStateValue, useWidth, util } from "quimera";
import React, { useEffect } from "react";

function Compra({ callbackChanged, idCompra, initCompra, useStyles }) {
  const [{ compra, status, vistaDetalle }, dispatch] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  useEffect(() => {
    util.publishEvent(compra.event, callbackChanged);
  }, [compra.event.serial]);

  useEffect(() => {
    !!initCompra &&
      dispatch({
        type: "onInitCompra",
        payload: {
          initCompra,
          callbackChanged,
        },
      });
    !initCompra &&
      !!idCompra &&
      dispatch({
        type: "onInitCompraById",
        payload: {
          idCompra,
          callbackChanged,
        },
      });
  }, [initCompra, idCompra]);

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const schema = getSchemas().compras;
  const editable = false;
  const titulo = `${compra.data.fechaCompra ? `${util.formatDate(compra.data.fechaCompra)} - ` : ""
    // }${compra.data.nombreConsumidor || ""}${compra.data.apellidosConsumidor ? ` ${compra.data.apellidosConsumidor}` : ""
    }${compra.data.importe ? `(${util.euros(compra.data.importe)})` : ""}`;

  if ((!initCompra && !idCompra) || initCompra?._status === "deleted") {
    return null;
  }

  if (idCompra && !compra.data.idCompra) {
    return null;
  }

  const estilosBoxImporte = {
    box: {
      activada: classes.neutro,
      desactivada: classes.neutro,
      inhabilitada: classes.neutro,
    },
  };

  return (
    <Quimera.Template id="Compra">
      {compra && (
        <QBox
          width={anchoDetalle}
          titulo={titulo}
          botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
        >
          <Grid container>
            <QModelBox id="compra.buffer" disabled={!editable} schema={schema}>
              <Grid size={{ xs: 12, sm: 12, md: 12 }} * justifyContent="center">
              <QSection
                title="Comercio"
                actionPrefix="compra.buffer/idCompra"
                alwaysInactive={true}
              >
                <Box display="flex">
                  <Typography variant="body1">
                    {compra.buffer.nombreComercio || "Sin Nombre"}
                  </Typography>
                </Box>
              </QSection>
          </Grid>

          <Grid container size={{ xs: 12, sm: 12, md: 12 }} justifyContent="space-between">
            <Box width={mobile ? 0.49 : 0.3}>
              <QSection
                title="Fecha Compra"
                actionPrefix="compra.buffer/idCompra"
                alwaysInactive={!editable}
                dynamicComp={() => (
                  <Box md={6}>
                    <Field.Date id="compra.buffer.fechaCompra" label="" fullWidth />
                  </Box>
                )}
              >
                <Box display="flex">
                  <Typography variant="body1">
                    {util.formatDate(compra.buffer.fechaCompra) || "Sin fecha compra"}
                  </Typography>
                </Box>
              </QSection>
            </Box>
            <Box width={mobile ? 0.5 : 0.3}>
              <QSection
                title="Importe"
                actionPrefix="compra.buffer/idCompra"
                alwaysInactive={!editable}
                estilos={estilosBoxImporte}
              >
                <Box display="flex" md={6}>
                  <Typography variant="body1">
                    {util.euros(compra.buffer.importe || 0)}
                  </Typography>
                </Box>
              </QSection>
            </Box>
          </Grid>
        </QModelBox>
          </Grid>
        </QBox >
      )
}
    </Quimera.Template >
  );
}

export default Compra;
