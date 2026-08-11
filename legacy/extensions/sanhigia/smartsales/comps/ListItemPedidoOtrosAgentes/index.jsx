import { Box, QListItemModel } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Icon, ListItemAvatar, ListItemText, Typography } from "@quimera/thirdparty";
import { util } from "quimera";

const useStyles = makeStyles(theme => ({
  card: {
    borderTop: `2px solid ${theme.palette.grey[200]}`,
    borderBottom: `1px solid ${theme.palette.grey[400]}`,
  },
  cardSelected: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    borderTop: `2px solid ${theme.palette.secondary.main}`,
  },
  avatarServido: {
    color: theme.palette.success.main,
  },
  avatarNoServido: {
    color: theme.palette.error.main,
  },
  avatarEnBorrador: {
    color: "#dd33fa",
  },
  avatarServidoParcial: {
    color: theme.palette.warning.main,
  },
}));

const colorServido = {
  Sí: "avatarServido",
  No: "avatarNoServido",
  Parcial: "avatarServidoParcial",
};

const iconoServido = {
  Sí: "radio_button_unchecked",
  No: "radio_button_unchecked",
  Parcial: "brightness_2",
};

function calculaColorAvatar(model) {
  if (model.enBorrador) {
    return "avatarEnBorrador";
  }

  return colorServido[model.servido];
}

function calculaIconoAvatar(model) {
  if (model.enBorrador) {
    return "attach_money";
  }

  return iconoServido[model.servido];
}

function ListItemPedidoOtrosAgentes({ renderAvatar, model, modelName, selected = false, funSecondaryLeft, avatar = "P", ...props }) {
  const classes = useStyles();
  const pedido = model;

  return (
    <QListItemModel modelName={modelName} model={model} selected={selected}>
      <ListItemAvatar>
        <Icon fontSize="large" className={classes[calculaColorAvatar(model)]}>
          {calculaIconoAvatar(model)}
        </Icon>
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Box width={1} display="flex" justifyContent="space-between">
            <Typography variant="body1">{pedido.nombreCliente || "CLIENTE"}</Typography>
            <Typography variant="body1">{util.euros(pedido.total)}</Typography>
          </Box>
        }
        secondary={
          <Box width={1} display="flex" justifyContent="space-between">
            <Box display="inline">
              <Typography component="span" variant="body2" color="textPrimary">
                {funSecondaryLeft ? funSecondaryLeft(pedido) : `${pedido.codigo}`}
              </Typography>
            </Box>
            <Box display="inline">
              <Typography component="span" variant="body2" color="textPrimary">
                {pedido.nombreapAgente}
              </Typography>
            </Box>
            <Box display="inline">
              <Typography component="span" variant="body2" color="textPrimary">{`${util.formatDate(
                pedido.fecha,
              )}`}</Typography>
            </Box>
          </Box>
        }
      />
    </QListItemModel>
  );
}

export default ListItemPedidoOtrosAgentes;
