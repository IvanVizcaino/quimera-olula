import {
  Box,
  Column,
  Container,
  Dialog,
  DynamicFilter,
  Icon,
  IconButton,
  Table,
  Typography,
} from "@quimera/comps";
import { Avatar, Hidden, List, ListItem, ListItemAvatar, ListItemText } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";
import { useEffect } from "react";

function DevolucionesPedidos({ useStyles }) {
  const [
    {
      pedidoscli,
      totalDevoluciones,
      modalBuscarFacturaVisible,
      modalDevolucionVisible,
      idPedido,
      ordenDevoluciones,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();
  const width = useWidth();
  useEffect(() => {
    dispatch({ type: "init" });
  }, [dispatch]);

  useEffect(() => {
    util.getSetting("appDispatch")({
      type: "setNombrePaginaActual",
      payload: { nombre: `Devoluciones de pedidos (${totalDevoluciones})` },
    });

    return () =>
      util.getSetting("appDispatch")({ type: "setNombrePaginaActual", payload: { nombre: "" } });
  }, [dispatch, totalDevoluciones]);

  const filtroProps = [
    {
      tipoCampo: "string",
      nombreCampo: "codigo",
      labelNombre: "Codigo",
      labelChip: "Código contiene ",
      porDefecto: true,
      value: "",
      tipo: "normal",
    },
    {
      tipoCampo: "string",
      nombreCampo: "nombrecliente",
      labelNombre: "Cliente",
      labelChip: "Cliente contiene ",
      porDefecto: false,
      value: "",
      tipo: "normal",
    },
    {
      tipoCampo: "date",
      nombreCampo: "fecha",
      labelNombre: "Fecha",
      labelChip: "Fecha: ",
      porDefecto: false,
      textoDesde: "desde",
      textoHasta: "hasta",
      value: { desde: null, hasta: null, fecha: null },
      opcionesPredefinidas: [
        { nombre: "", fecha: null, desde: null, hasta: null },
        { nombre: "Hoy", fecha: util.today(), desde: null, hasta: null },
        { nombre: "Esta semana", fecha: null, desde: util.firstOfWeek(), hasta: util.lastOfWeek() },
        { nombre: "Hasta ayer", fecha: null, desde: null, hasta: util.yesterday() },
        { nombre: "Este mes", fecha: null, desde: util.firstOfMonth(), hasta: util.lastOfMonth() },
        { nombre: "Este año", fecha: null, desde: util.firstOfYear(), hasta: util.lastOfYear() },
      ],
      tipo: "normal",
    },
  ];

  return (
    <Quimera.Template id="DevolucionesPedidos">
      <Container className={classes.container} disableGutters={width === "xs" || width === "sm"}>
        <Box id="Caja filtro" width={1} mx={1} mb={1} display="flex">
          <Box flexGrow={1}>
            <DynamicFilter id="DynamicFilterDevolucionesPedido" propiedades={filtroProps} />
          </Box>
          <Box flexGrow={0} ml={1}>
            <IconButton
              id="buscarFactura"
              tooltip="Crear devolución"
              size="medium"
              onClick={() => dispatch({ type: "onBuscarFacturaClicked", payload: {} })}
            >
              <Icon fontSize="large">add</Icon>
            </IconButton>
          </Box>
        </Box>
        <Dialog
          open={modalBuscarFacturaVisible}
          fullWidth
          maxWidth="md"
          fullScreen={width === "xs" || width === "sm"}
        >
          <Quimera.SubView
            id="DevolucionesPedidos/BuscarFactura"
            callbackCerrado={() => dispatch({ type: "onCerrarBuscarFactura", payload: {} })}
          />
        </Dialog>
        <Dialog
          open={modalDevolucionVisible}
          fullWidth
          maxWidth="lg"
          fullScreen={width === "xs" || width === "sm"}
        >
          <Quimera.View
            id="DevolucionDetalle"
            idPedido={idPedido}
            callbackCerrado={() => dispatch({ type: "onCerrarDevolucionDetalle", payload: {} })}
          />
        </Dialog>
        <Hidden smDown>
          <Table
            id="tdbPedidoscli"
            idField="idpedido"
            data={pedidoscli}
            clickMode="line"
            orderColumn={ordenDevoluciones}
          >
            <Column.Text
              id="codigo"
              header="Código"
              order="codigo"
              pl={2}
              value={pedido => pedido.codigo}
              width={150}
            />
            <Column.Text
              id="nombre"
              header="Cliente"
              order="nombrecliente"
              value={pedido => pedido.nombrecliente}
              flexGrow={1}
              width={350}
            />
            <Column.Date
              id="fecha"
              header="Fecha"
              order="fecha"
              value={pedido => pedido.fecha}
              width={140}
            />
            <Column.Text
              id="servido"
              header="Servido"
              order="servido"
              value={pedido => pedido.servido}
              width={120}
            />
            <Column.Text
              id="estadopago"
              header="Estado"
              order="estadopago"
              value={pedido => pedido.estadopago}
              width={180}
            />
            <Column.Currency
              id="importe"
              header="Importe"
              order="total"
              value={pedido => pedido.total}
              width={140}
            />
          </Table>
        </Hidden>
        <Hidden mdUp>
          <List>
            {pedidoscli.map(pedido => (
              <ListItem
                key={pedido.id}
                divider={true}
                onClick={() =>
                  dispatch({ type: "onTdbPedidoscliRowClicked", payload: { id: pedido.id } })
                }
              >
                <ListItemAvatar>
                  <Avatar>{pedido.nombrecliente.substring(0, 1).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography component="div" variant="body1">
                      <strong>{`${pedido.codigo}`}</strong>
                      {` ${pedido.nombrecliente}`}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography component="span" variant="body2">{`${util.formatDate(
                        pedido.fecha,
                      )}`}</Typography>
                      <Typography component="span" variant="body2">{`${util.euros(
                        pedido.total,
                      )}`}</Typography>
                    </Box>
                  }
                ></ListItemText>
              </ListItem>
            ))}
          </List>
        </Hidden>
      </Container>
    </Quimera.Template>
  );
}

export default DevolucionesPedidos;
