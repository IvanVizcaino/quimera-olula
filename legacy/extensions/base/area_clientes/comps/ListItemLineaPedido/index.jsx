import { Box, QListItemModel } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Avatar, ListItemAvatar, ListItemText, Typography } from "@quimera/thirdparty";
import { useStateValue, util } from "quimera";

const useStyles = makeStyles(theme => ({
  avatar: {
    backgroundColor: `${theme.palette.success.main} !important`,
  },
  card: {
    borderBottom: `1px solid ${theme.palette.grey[400]}`,
  },
  cardSelected: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    borderTop: `2px solid ${theme.palette.secondary.main}`,
  },
}));

function ListItemLineaPedido({ selected = false, funPrimaryLeft, funPrimaryRight, hideSecondary = false, model, modelName, ...props }) {
  const [_, dispatch] = useStateValue();
  const classes = useStyles();
  const linea = model;

  return (
    <QListItemModel modelName={modelName} model={linea} selected={selected}>
      <ListItemAvatar>
        <Avatar className={classes.avatar}>{linea.cantidad}</Avatar>
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Box width={1} display="flex" justifyContent="space-between">
            <Box display="inline">
              {funPrimaryLeft ? (
                funPrimaryLeft(linea)
              ) : (
                <Box>
                  <Typography variant="body1">{linea.descripcion}</Typography>
                </Box>
              )}
            </Box>
            <Box display="inline">
              {funPrimaryRight ? (
                funPrimaryRight(linea)
              ) : (
                <Typography variant="body1">{util.euros(linea.pvpTotal)}</Typography>
              )}
            </Box>
          </Box>
        }
        secondary={
          !hideSecondary && (
            <Box width={1} mt={0.5} display="flex" justifyContent="space-between">
              <Box display="inline">
                <Typography
                  component="span"
                  variant="body2"
                  color="textPrimary"
                >{`${linea.referencia}`}</Typography>
              </Box>
              <Box display="inline">
                <Typography component="span" variant="body2" color="textPrimary">{`${linea.cantidad
                  } x ${util.euros(linea?.aplicarPvpParticular || linea?.aplicarPvpParticular == undefined ? linea.pvpUnitario : linea.pvpReferencia)}`}</Typography>
              </Box>
            </Box>
          )
        }
      />
    </QListItemModel>
  );
}

export default ListItemLineaPedido;
