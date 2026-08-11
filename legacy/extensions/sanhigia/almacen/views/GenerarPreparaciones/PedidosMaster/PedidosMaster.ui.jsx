import { Avatar, Box, Grid, QBox, QBoxButton, QListModel } from "@quimera/comps";
import { CircularProgress } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth } from "quimera";
import { useCallback } from "react";

import { ListItemPedido } from "../../../comps";

function PedidosMaster({ idPedido }) {
  const [{ arrayMultiCheck, habilitarMulticheck, modalAgruparPedidosGenerarPreparaciones, pedidosGenerarPreparaciones }, dispatch] =
    useStateValue();

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;

  const callbackNewPedidoChanged = useCallback(
    payload => dispatch({ type: "onNewPedidoChanged", payload }),
    [],
  );

  const botones = [
    {
      icon: "filter_alt",
      id: "mostrarFiltro",
      text: "Mostrar filtro",
      badgeVisible: Object.keys(pedidosGenerarPreparaciones.filter?.and ?? {}).length,
      badgeContent: Object.keys(pedidosGenerarPreparaciones.filter?.and ?? {}).length,
    },
    {
      icon: "library_add_check",
      id: "habilitarMulticheck",
      text: "Habilitar multicheck",
    },
  ];

  return (
    <Quimera.Template id="PedidosMaster">
      <Box width={anchoDetalle}>
        <QBox
          titulo={"Generar preparaciones"}
          botones={botones}
          sideButtons={
            <>
              <QBoxButton
                id="botonAgruparPedidosGenerarPreparaciones"
                title="Agrupar pedidos"
                icon="content_copy"
                disabled={arrayMultiCheck.length < 1}
              />
            </>
          }
        >
          {/* {idPedido === "nuevo" && (
            <Quimera.View id="PedidosCliNuevo" callbackGuardado={callbackNewPedidoChanged} />
          )} */}
          <Quimera.SubView id="GenerarPreparaciones/PedidosFiltro" />
          {pedidosGenerarPreparaciones.loading ? (
            <Grid container direction="column" justifyContent="center" alignItems="center">
              <CircularProgress size={50} style={{ marginTop: 16 }} />
            </Grid>
          ) : (
            <QListModel
              data={pedidosGenerarPreparaciones}
              modelName={habilitarMulticheck ? "pedidosGenerarPreparacionesCheck" : "pedidosGenerarPreparaciones"}
              // modelName={"pedidosGenerarPreparaciones"}
              ItemComponent={ListItemPedido}
              itemProps={{
                renderAvatar: () => (
                  <Avatar>{pedidosGenerarPreparaciones.dict[idPedido]?.nombreCliente?.charAt(0)}</Avatar>
                ),
                renderId: () => pedidosGenerarPreparaciones.dict[idPedido]?.nombreCliente,
                habilitarMulticheck,
                arrayMultiCheck,
              }}
              funSecondaryLeft={pedido =>
                pedido.descripcion ? pedido.descripcion : "Sin descripcion"
              }
              scrollable={true}
              altoCabecera={160}
            />
          )}

        </QBox>
      </Box>
    </Quimera.Template>
  );
}

export default PedidosMaster;
