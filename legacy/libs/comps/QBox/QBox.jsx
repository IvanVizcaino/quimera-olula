import { makeStyles, useTheme } from "@quimera/styles";
import { useWidth } from "quimera";
import './QBox.style.scss';

import { Badge, Box, Icon, IconButton } from "../";

const headerHeight = 47;

const useStyles = makeStyles(theme => ({
  details: {
    flexBasis: "50%",
    // padding: "1em",
    boxSizing: "border-box",
    // maxWidth: '800px',
    // flexGrow: '999',
  },
  detailsMin: {
    flexBasis: "100%",
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    pointerEvents: "none",
    listStyle: "none",
    fontSize: "1.7rem",
    lineHeight: "1.334",
    letterSpacing: "0em",
    color: theme.custom.menu.main,
    height: `${headerHeight}px`,
    // height: `47px`,
  },
  titulo: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  iconoCabecera: {
    "pointerEvents": "initial",
    "transition": "all .2s ease-in-out",
    "&$disabled": {
      color: "lightgrey",
    },
    "&:hover": {
      color: theme.custom.menu.accent,
      transform: "scale(1.2)",
      fontWeight: "bold",
    },
    "&:active": {
      color: theme.custom.menu.accent,
    },
  },
  cabeceraButtonActions: {
    pointerEvents: "initial",
    gap: "10px",
  },
  hr: {
    borderColor: theme.custom.menu.accent,
    marginTop: "0",
  },
  icon: {
    "color": theme.custom.menu.alternative,
    "transition": "all .2s ease-in-out",
    "&:hover": {
      color: theme.custom.menu.accent,
      transform: "scale(1.2)",
    },
  },
}));

function QBox({
  children,
  botones = [],
  sideButtons = [],
  botonesCabecera = [],
  cabeceraButtons = [],
  noHeight = false,
  titulo,
  estilos,
  maxWidth = "800px",
  flexGrow = "999",
  className = "",
  ...props
}) {
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const classes = useStyles();
  const theme = useTheme();
  const clasesTitle = estilos ? estilos?.titulo : classes.titulo;

  return (
    <details
      className={`${classes.details} ${className}`}
      open
      style={{
        maxWidth,
        flexGrow,
      }}
      {...props}
    >
      <summary className={estilos ? estilos.summary : classes.summary}>
        <Box className={`${clasesTitle} title`}>{titulo}</Box>
        <Box display="flex" justifyContent="flex-end">
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            className={classes.cabeceraButtonActions}
          >
            {cabeceraButtons}
          </Box>
          {botonesCabecera?.map(b => (
            <Badge key={b.id} color="primary" badgeContent={b.badgeContent} invisible={b.badgeInvisible} overlap="circular">
              <IconButton
                id={b.id}
                fontSize="large"
                disabled={b.disabled}
                title={b.text}
                {...b.props}
              >
                <Icon
                  fontSize="large"
                  className={classes.iconoCabecera}
                  style={{
                    color: b.color ?? theme.custom.menu.alternative,
                  }}
                >
                  {b.icon}
                </Icon>
              </IconButton>
            </Badge>
          ))}
        </Box>
      </summary>
      <hr className={classes.hr} />
      <Box
        display="flex"
        flexDirection={mobile ? "column" : "row"}
        justifyContent="space-between"
        style={{ gap: "1em", boxSizing: "border-box" }}
      >
        <Box
          display="flex"
          flexDirection={mobile ? "row" : "column"}
          alignItems={mobile ? "flex-start" : "center"}
        >
          {botones.map(b => (
            <Badge
              key={b.id}
              invisible={!b.badgeVisible}
              color="secondary"
              overlap="circular"
              badgeContent={b.badgeContent}
            >
              <IconButton id={b.id} key={b.id} size="small" disabled={b.disabled} title={b.text}>
                <Icon fontSize="large" className={classes.icon}>
                  {b.icon}
                </Icon>
              </IconButton>
            </Badge>
          ))}
          {sideButtons}
        </Box>
        {/* 150 es la suma de 60 de header (60), 32 de los margenes superior e inferior del QBox (92), 47 de la altura del titulo del QBox (139), 2 de la altura del hr (141), los 9 restantes los pongo para que no se active el scroll del contenedor  */}
        {noHeight ? (
          <Box
            // maxHeight={`calc(100vh - 150px)`}
            // height={`calc(100vh - 150px)`}
            overflow="auto"
            flexGrow={999}
            style={{ paddingRight: "15px" }}
          >
            {children}
          </Box>
        ) : (
          <Box
            maxHeight={`calc(100vh - 150px)`}
            height={`calc(100vh - 150px)`}
            overflow="auto"
            flexGrow={999}
          // style={{ paddingRight: "15px" }}
          >
            {children}
          </Box>
        )}

      </Box>
    </details>
  );
}

export default QBox;
