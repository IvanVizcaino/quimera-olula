import { Button } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { ButtonGroup, CircularProgress } from "@quimera/thirdparty";
import { useStateValue, util } from "quimera";
import { ACL } from "quimera/lib";

const useStyles = makeStyles(theme => ({
  button: {
    "fontSize": "1.6em",
    "width": "50%",
    "backgroundColor": theme.palette.grey[600],
    "color": "white",
    "transform": "skew(-20deg)",
    "&>*": {
      transform: "skew(20deg)",
    },
  },
  noButton: {
    "fontSize": "1.6em",
    "width": "50%",
    "backgroundColor": theme.palette.grey[600],
    "color": "white",
    "transform": "skew(-20deg)",
    "&>*": {
      transform: "skew(20deg)",
    },
    "&:hover": {
      cursor: "auto",
      backgroundColor: theme.palette.grey[600],
      color: "white",
    },
  },
  crearPedido: {
    "fontSize": "1.6em",
    "width": "50%",
    "backgroundColor": theme.palette.grey[600],
    "color": "white",
    "transform": "skew(-20deg)",
    "&>*": {
      transform: "skew(20deg)",
    },
  },
  aprobarPresupuesto: {
    // "padding": "10px",
    "fontSize": "1.3em",
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
  },
  error: {
    backgroundColor: "#FF9191",
  },
  ganado: {
    borderRadius: "0 75px 25px 0",
  },
  perdido: {
    borderRadius: "25px 0 0 75px",
  },
  progress: {
    color: "white",
  },
}));

function EstadoTratoComp({ field, value, trato, procesando, onChanged, ...props }) {
  const [state, dispatch] = useStateValue();
  const fieldValue = !value && field ? state[field] : value;
  const classes = useStyles();

  const exigirGenerarPedido = !!trato?.exigirGenerarPedido || false;
  const tipotrato = trato?.idTipotrato || 0;
  const esTratoFarma = tipotrato === util.getUser().tratolicenciafarma;
  const tengoPermisosFarma = ACL.can("crm.trato.farma");
  const disabledFarma = esTratoFarma && !tengoPermisosFarma;
  const tienePedido = trato?.idPedido ? true : false;
  const tieneLicencia = trato?.idLicencia ? true : false;
  const tienePresupuesto = trato?.idPresupuesto ? true : false;
  const tratoGanado = trato?.estado === "Ganado";
  const titlePerdido = "Perdido";
  const titleGanado = tratoGanado
    ? "Ganado"
    : trato?.exigirGenerarPedido
      ? trato?.idPresupuesto
        ? "Aprobar presupuesto"
        : "Crear pedido"
      : "Ganado";

  const userIsMKT = util.getUser().group === "MKT" ? true : false;
  const classesPerdido = `${classes.button} ${classes.perdido} ${fieldValue === "Perdido" ? classes.error : ""
    }`;

  const classBotonGanado = tratoGanado
    ? classes.button
    : !exigirGenerarPedido
      ? classes.button
      : tienePresupuesto
        ? classes.aprobarPresupuesto
        : classes.crearPedido;
  const classesGanado = `${classBotonGanado} ${classes.ganado} ${fieldValue === "Ganado" ? classes.success : ""
    }`;

  const onClick = newValue => {
    newValue = newValue !== fieldValue ? newValue : "-";
    onChanged && onChanged(newValue);
    !onChanged &&
      dispatch({
        type: `on${util.camelId(field)}Changed`,
        payload: { field, value: newValue },
      });
  };

  return (
    <ButtonGroup aria-label="outlined primary button group" {...props}>
      <Button
        id="EstadoTratoPerdido"
        className={classesPerdido}
        disabled={procesando || tienePedido || tieneLicencia || disabledFarma}
        onClick={() => onClick("Perdido")}
      >
        {titlePerdido}
      </Button>
      <Button
        id="EstadoTratoGanado"
        className={classesGanado}
        disabled={procesando || disabledFarma}
        onClick={() => onClick("Ganado")}
      >
        {!procesando ? titleGanado : <CircularProgress className={classes.progress} />}
      </Button>
    </ButtonGroup>
  );
}

export default EstadoTratoComp;
