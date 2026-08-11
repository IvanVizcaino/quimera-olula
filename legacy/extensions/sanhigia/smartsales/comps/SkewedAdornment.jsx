import { Box, Icon } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";

const useStyles = makeStyles(theme => ({
  adornment: {
    boxSizing: "border-box",
    height: "100%",
    maxHeight: "24px",
    backgroundColor: "#231",
    transform: "skew(-20deg)",
    margin: "5px",
    marginLeft: "-5px",
    padding: "4px 3px 2px",
    boxShadow: "5px 0px 15px -8px rgba(0, 0, 0, 0.5)",
    userSelect: "none",
    maxWidth: "50px",
  },
  icon: {
    color: "white",
    fontSize: "16px",
    transform: "skew(20deg)",
  },
  finished: {
    textDecoration: "line-through",
    opacity: "0.5",
  },
  disabled: {
    opacity: "0.5",
  },
  success: {
    backgroundColor: "#99E2CE",
  },
  success_alt: {
    backgroundColor: "#46C756",
  },
  error: {
    backgroundColor: "#FF9191",
  },
}));

export default function SkewedAdornment({ adornment, adornmentClass, finished, ...props }) {
  const classes = useStyles();

  let adornmentClasses = `${classes.adornment} ${classes[adornmentClass]}`;
  finished && (adornmentClasses += ` ${classes.finished}`);

  return (
    <Box className={adornmentClasses} display="flex" alignItems="center" justifyContent="center" {...props}>
      {adornment === "whatsapp" ? (
        <img src="/img/whatsapp-icon.svg" width="16px" height="16px" alt="Whatsapp" style={{ transform: "skew(20deg)" }} />
      ) : (
        <Icon className={classes.icon} fontSize="small">
          {adornment}
        </Icon>
      )}
    </Box>
  );
}
