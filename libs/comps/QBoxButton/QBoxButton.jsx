import { makeStyles } from "@quimera/styles";
import PropTypes from "prop-types";

import { Box, CircularProgress, Icon, IconButton } from "../";

const useStyles = makeStyles(theme => ({
  icon: {
    "color": theme.palette.menu.alternative,
    "transition": "all .2s ease-in-out",
    "&:hover": {
      color: theme.palette.menu.accent,
      transform: "scale(1.2)",
    },
  },
}));

function QBoxButton({ disabled, estilos, id, icon, busy, ...props }) {
  const classes = useStyles();

  return (
    <Box sx={{ position: "relative" }}>
      {busy && (
        <CircularProgress
          size={68}
          style={{
            color: "#00FF00",
            position: "absolute",
            top: -6,
            left: -6,
            zIndex: 1,
          }}
        />
      )}
      <IconButton id={id} size="small" disabled={disabled} {...props}>
        <Icon fontSize="large" className={!disabled ? (estilos ? estilos.icon : classes.icon) : ""}>
          {icon}
        </Icon>
      </IconButton>
    </Box>
  );
}

QBoxButton.propTypes = {
  id: PropTypes.string,
  icon: PropTypes.string,
  estilos: PropTypes.object,
};

QBoxButton.defaultProps = {};

export default QBoxButton;
