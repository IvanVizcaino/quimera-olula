import { Box, Field, QBox, QListModel, QModelBox, QTitleBox, Typography } from "@quimera/comps";
// import { Direccion, MiLineaPedido, Totales } from "../../comps";
import { Direccion, MiLineaPedido, Totales } from "@quimera-extension/base-area_clientes";
import { DocAgente } from "@quimera-extension/base-ventas";
import Quimera, { getSchemas, PropValidation, useStateValue, useWidth, util } from "quimera";
import React, { useCallback, useEffect } from "react";

function MiPedido({ callbackChanged, idPedido, initPedido, useStyles }) {
  const [{ lineas, logic, pedido, vistaDetalle }, dispatch] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  useEffect(() => {
    util.publishEvent(pedido.event, callbackChanged);
  }, [pedido.event.serial]);

  useEffect(() => {
    !!initPedido &&
      dispatch({
        type: "onInitPedido",
        payload: {
          initPedido,
        },
      });
    !initPedido &&
      !!idPedido &&
      dispatch({
        type: "onInitPedidoById",
        payload: {
          idPedido,
        },
      });
  }, [initPedido, idPedido]);

  // Necesario para que no salte el useEffect de onInit en cada render de LineaPedidoCliNueva
  const callbackNuevaLinea = useCallback(
    payload => dispatch({ type: "onLineaCreada", payload }),
    [dispatch],
  );

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const schema = getSchemas().misPedidos;
  const editable = logic.pedidoEditable(pedido.data);

  if ((!initPedido && !idPedido) || initPedido?._status === "deleted") {
    return null;
  }

  if (idPedido && !pedido.data.idPedido) {
    return null;
  }

  return (
    <Quimera.Template id="PedidoDetalle">
      {pedido && (
        <QBox
          width={anchoDetalle}
          titulo={`Pedido ${pedido.data.codigo} / (${pedido.data.referencia})`}
          botonesCabecera={[
            { icon: "more_horiz", id: "mas", text: "Más" },
            { icon: "arrow_back", id: "atras", text: "Atrás" },
          ]}
          sideButtons={
            <>{/* <QBoxButton id='printPedido' title='Imprimir pedido' icon='print' /> */}</>
          }
        >
          <QModelBox id="pedido.buffer" disabled={!editable} schema={schema}>
            {vistaDetalle === "principal" ? (
              <Box>
                {pedido.buffer.codClienteTienda ? (
                  <QTitleBox titulo={`Cliente ${pedido.buffer.codClienteTienda ?? ""}`}>
                    <Typography variant="h5">{pedido.buffer.nombreClienteTienda}</Typography>
                    <Typography variant="subtitle2">{pedido.buffer.nombreCliente}</Typography>
                  </QTitleBox>
                ) : (
                  <QTitleBox titulo={`Cliente ${pedido.buffer.codCliente ?? ""}`}>
                    <Typography variant="h5">{pedido.buffer.nombreCliente}</Typography>
                  </QTitleBox>
                )}
                <QTitleBox titulo="Dirección">
                  <Direccion documento={pedido.buffer} inline />
                </QTitleBox>

                <Box display="flex" gap={2}>
                  <Field.Schema id="pedido.buffer/servido" schema={schema} fullWidth disabled />
                  <Field.Schema id="pedido.buffer/estado" schema={schema} fullWidth disabled />
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <QTitleBox titulo="Fecha">
                    <Box display="flex" alignItems="center">
                      <Typography variant="h5">{util.formatDate(pedido.buffer.fecha)}</Typography>
                    </Box>
                  </QTitleBox>
                  <QTitleBox titulo="Fecha prevista">
                    <Box display="flex" alignItems="center">
                      <Typography variant="h5">
                        {util.formatDate(pedido.buffer.fechasalidareal)}
                      </Typography>
                    </Box>
                  </QTitleBox>
                  <Totales
                    totales={[
                      { name: "Neto", value: pedido.buffer.neto },
                      { name: "Total IVA", value: pedido.buffer.totalIva },
                      { name: "Total", value: pedido.buffer.total },
                    ]}
                  />
                </Box>
                <QListModel
                  data={lineas}
                  title="Líneas"
                  modelName="lineas"
                  ItemComponent={MiLineaPedido}
                  itemProps={{
                    variant: "section",
                  }}
                  disabled={!editable}
                />
              </Box>
            ) : (
              <Box width={1}>
                <DocAgente />
              </Box>
            )}
          </QModelBox>
        </QBox>
      )}
    </Quimera.Template>
  );
}

export default MiPedido;
