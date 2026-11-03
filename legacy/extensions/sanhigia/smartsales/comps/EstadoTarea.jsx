import { Button } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { ButtonGroup, CircularProgress } from "@quimera/thirdparty";
import { useStateValue, util } from "quimera";
import { useState } from "react";

const useStyles = makeStyles(theme => ({
  button: {
    "fontSize": "1em",
    "width": "50%",
    "backgroundColor": theme.palette.grey[600],
    "color": "white",
    "transform": "skew(-20deg)",
    "&>*": {
      transform: "skew(20deg)",
    },
  },
  success: {
    backgroundColor: "#99E2CE",
    color: theme.palette.grey[700],
  },
  error: {
    backgroundColor: "#FF9191",
  },
  completada: {
    borderRadius: "0 75px 25px 0",
  },
  noCompletada: {
    borderRadius: "25px 0 0 75px",
  },
}));

function EstadoTarea({ field, value, onChanged, ...props }) {
  const [state, dispatch] = useStateValue();
  const fieldValue = !value && field ? state[field] : value;
  const classes = useStyles();
  const [loadingCoords, setLoadingCoords] = useState(false);

  const classesNoCompletada = `${classes.button} ${classes.noCompletada} ${!fieldValue ? classes.error : ""
    }`;
  const classesCompletada = `${classes.button} ${classes.completada} ${fieldValue ? classes.success : ""
    }`;

  const successCords = (pos, newValue) => {
    setLoadingCoords(false);
    const latitud = pos.coords.latitude;
    const longitud = pos.coords.longitude;

    !onChanged &&
      dispatch({
        type: `on${util.camelId(field)}Changed`,
        payload: { field, value: newValue, latitud, longitud },
      });
  };

  const errorCords = error => {
    setLoadingCoords(false);
    let errorMessage = "";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "El usuario denegó el permiso de ubicación.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "La información de ubicación no está disponible.";
        break;
      case error.TIMEOUT:
        errorMessage = "Se agotó el tiempo de espera para obtener la ubicación.";
        break;
      default:
        errorMessage = "Un error desconocido ocurrió.";
    }
    dispatch({
      type: `getCurrentPositionError`,
      payload: { errorMessage },
    });
  };

  const onClick = newValue => {
    setLoadingCoords(true);
    navigator.geolocation.getCurrentPosition(coords => successCords(coords, newValue), errorCords);
  };

  // console.log("mimensaje_EstadoTarea", loadingCoords, fieldValue);

  return (
    <ButtonGroup aria-label="outlined primary button group" {...props}>
      <Button
        id="EstadoTareaNoCompletada"
        className={classesNoCompletada}
        onClick={() =>
          fieldValue &&
          !onChanged &&
          dispatch({
            type: `on${util.camelId(field)}Changed`,
            payload: { field, value: false },
          })
        }
        disabled={loadingCoords}
      >
        {loadingCoords && fieldValue ? (
          <CircularProgress style={{ color: "#FFF" }} />
        ) : (
          "No Completada"
        )}
      </Button>
      <Button
        id="EstadoTareaCompletada"
        className={classesCompletada}
        onClick={() => !fieldValue && onClick(true)}
        disabled={loadingCoords}
      >
        {loadingCoords && !fieldValue ? (
          <CircularProgress style={{ color: "#FFF" }} />
        ) : (
          "Completada"
        )}
      </Button>
    </ButtonGroup>
  );
}

export default EstadoTarea;
