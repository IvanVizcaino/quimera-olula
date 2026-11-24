import { Box, QListItemModel } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Avatar, Chip, ListItemAvatar, ListItemText, Typography } from "@quimera/thirdparty";
import { util } from "quimera";
import React from "react";

const useStyles = makeStyles(theme => ({
  card: {
    borderTop: `2px solid ${theme.palette.grey[200]}`,
    borderBottom: `1px solid ${theme.palette.grey[400]}`,
  },
  cardSelected: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    borderTop: `2px solid ${theme.palette.secondary.main}`,
  },
  pte: {
    backgroundColor: `${theme.palette.error.main} !important`,
  },
  parcial: {
    backgroundColor: `${theme.palette.warning.main} !important`,
  },
  servido: {
    backgroundColor: `${theme.palette.success.main} !important`,
  },
  anulado: {
    backgroundColor: "#b0b0b0 !important",
  },
  estadoPte: {
    backgroundColor: theme.palette.error.main + " !important",
    color: theme.palette.error.contrastText + " !important",
  },
  estadoTerminado: {
    backgroundColor: theme.palette.success.main + " !important",
    color: theme.palette.success.contrastText + " !important",
  },
  estadoCargado: {
    backgroundColor: theme.palette.info.main + " !important",
    color: theme.palette.info.contrastText + " !important",
  },
  estadoProduccion: {
    backgroundColor: theme.palette.warning.main + " !important",
    color: theme.palette.warning.contrastText + " !important",
  },
}));

const claseEstado = (estado, classes) =>
  ({
    PTE: classes.estadoPte,
    TERMINADO: classes.estadoTerminado,
    CARGADO: classes.estadoCargado,
  })[estado] ?? classes.estadoProduccion;

function ListItemMisPedidos({ renderAvatar, model, selected = false, funSecondaryLeft, avatar = "P", ...props }) {
  const pedido = model;
  const classes = useStyles();
  const estadoServido = {
    Sí: {
      clase: classes.servido,
      titulo: "Servido",
    },
    No: {
      clase: classes.pte,
      titulo: "Pendiente",
    },
    Parcial: {
      clase: classes.parcial,
      titulo: "Servido parcial",
    },
    Anulado: {
      clase: classes.anulado,
      titulo: "Anulado",
    },
  };

  // console.log("mimensaje_model", model);

  return (
    <QListItemModel
      className={selected ? classes.cardSelected : classes.card}
      model={model}
      {...props}
      disableGutters
    >
      <ListItemAvatar>
        <Avatar className={estadoServido[model.servido].clase}>
          <></>
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <React.Fragment>
            <Box width={1} display="flex" justifyContent="space-between">
              <Box display="inline">{`${pedido.codigo} de ${util.formatDate(pedido.fecha)} ${pedido.referencia
                }`}</Box>
              <Box display="inline" mr={1}>
                {`F. Prevista: ${util.formatDate(pedido.fechasalidareal)}`}
              </Box>
            </Box>
          </React.Fragment>
        }
        secondary={
          <React.Fragment>
            <Box width={1} display="flex" justifyContent="space-between">
              <Box display="inline">
                {pedido.estado && (
                  <Chip size="small" label={pedido.estado} className={claseEstado(pedido.estado, classes)} />
                )}
              </Box>
              <Box display="inline" mr={1}>
                {" "}
                <Typography component="span" variant="body2" color="textPrimary">{`${util.euros(
                  pedido.total,
                )}`}</Typography>
              </Box>
            </Box>
          </React.Fragment>
        }
      />
    </QListItemModel>
  );
}

export default ListItemMisPedidos;
