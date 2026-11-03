import { Icon } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";

const useStyles = makeStyles(theme => ({
  article: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  icon: {
    display: "grid",
    placeContent: "center",
    width: "35px",
    height: "35px",
    color: "white",
    borderRadius: "100%",
    margin: "5px",
    padding: "5px",
    backgroundColor: "grey",
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
  info: {
    backgroundColor: "#76ccfd",
  },
}));

export default function ButtonContacto({
  icon,
  klass,
  disabled,
  onClick,
  iconProps = {},
  ...props
}) {
  const classes = useStyles();

  return (
    <article
      className={classes.article}
      onClick={() => !disabled && onClick && onClick()}
      {...props}
    >
      <Icon className={`${classes.icon} ${!disabled ? classes[klass] : ""}`} {...iconProps}>
        {icon === "whatsapp" ? (
          <img
            src="/img/whatsapp-icon.svg"
            width={`${iconProps?.style?.width ?? 32}px`}
            height={`${iconProps?.style?.width ?? 32}px`}
            style={{ "margin": "0px 0px 1px 1px" }}
            alt="Whatsapp Logo"
          />
        ) : (
          icon
        )}
      </Icon>
    </article>
  );
}
