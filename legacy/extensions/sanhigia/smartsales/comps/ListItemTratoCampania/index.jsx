import "./ListItemTratoCampania.style.scss";

import { Box, Chip, Collapse, Icon, IconButton, QListItemModel } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Avatar, ListItemAvatar, ListItemText, Typography } from "@quimera/thirdparty";
import { navigate, useStateValue, util } from "quimera";
import { useState } from "react";

import { ButtonContacto } from "../../comps";

const useStyles = makeStyles(theme => ({
  card: {
    borderBottom: `none`,
  },
  cardSelected: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    borderTop: `2px solid ${theme.palette.secondary.main}`,
  },
  chip: {
    borderRadius: 4,
    marginRight: theme.spacing(0.5),
    fontSize: "0.8rem",
    backgroundColor: `${theme.palette.warning.main}`,
    textTransform: "uppercase",
  },
  icon: {
    // "color": theme.custom.menu.alternative,
    // "background": "#6666FF",
    // "width": "34px",
    // "height": "35px",
    // "marginTop": "10px",
    // "marginRight": "15px",
    "cursor": "pointer",
    "transition": "all .2s ease-in-out",
    "&:hover": {
      color: theme.custom.menu.accent,
      transform: "scale(1.2)",
    },
  },
}));

const iconEstado = {
  "Sin Agente": {
    icon: "",
    color: "#cc024a",
  },
  "Auto": {
    icon: "",
    color: "#ff5722",
  },
  "Asignado": {
    icon: "",
    color: "#357037",
  },
  "Publicado": {
    icon: "",
    color: "#0b9adb",
  },
  "-": {
    icon: "pause",
  },
};

function ListItemTratoCampania({ selected = false, trato, modelName, callbackCambiada, ...props }) {
  const [_, dispatch] = useStateValue();
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleToggleOpenClicked = () => {
    setOpen(!open);
    // open && callbackFocus();
  };

  const clienteOContacto = (trato, tipo) => {
    let dato = "";
    if (trato.contacto) {
      dato = trato[`${tipo}Contacto`] || "";
    } else if (trato.cliente) {
      dato = trato[`${tipo}Cliente`] || "";
    }

    if (tipo === "telefono" && (trato.telefonoContacto || trato.telefonoCliente)) {
      dato += " - ";
    }

    return dato;
  };
  const avatar = iconEstado[trato?.estadoAsigAgente ?? "-"];

  return (
    <Box className={`${selected ? classes.cardSelected : classes.card} ${"ListItemTratoCampania"}`}>
      <QListItemModel modelName={modelName} model={trato} selected={false}>
        <ListItemAvatar>
          <Avatar style={{ background: avatar.color }}>
            {avatar.icon && <Icon>{avatar.icon}</Icon>}
            {!avatar.icon && avatar.content && avatar.content}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          disableTypography
          onClick={() =>
            dispatch({
              type: "onTratosCampaniaClicked",
              payload: { item: trato },
            })
          }
          primary={
            <Box
              width={1}
              display="flex"
              justifyContent="space-between"
              style={{ overflow: "hidden", gap: "1em" }}
            >
              <Box display={"flex"}>
                <Typography
                  component="span"
                  variant="body1"
                  color="textPrimary"
                  style={{ fontWeight: 700, textOverflow: "ellipsis" }}
                >
                  {trato?.idContactoCampania && (
                    <Chip label={"CONTACTO"} className={classes.chip} />
                  )}
                  {trato?.etiquetaAC && <Chip label={"AC"} size="small" className={classes.chip} />}
                  {`${trato?.titulo ?? ""} || ${clienteOContacto(trato, "nombre")}`}
                </Typography>
              </Box>
              <Box display={"flex"}>
                <Typography
                  component="span"
                  variant="body1"
                  color="textPrimary"
                  style={{ fontWeight: 700, textOverflow: "ellipsis" }}
                >
                  {util.formatDate(trato?.fecha)}
                </Typography>
              </Box>
            </Box>
          }
          secondary={
            <Box display={"flex"} justifyContent="space-between">
              <Box display={"flex"}>
                <Typography
                  component="span"
                  variant="caption"
                  color="textPrimary"
                  style={{ textOverflow: "ellipsis" }}
                >
                  {`${trato?.tipotrato ?? "*"} || ${util.euros(trato?.valor ?? 0)}`}
                </Typography>
              </Box>
              <Box display={"flex"}>
                {/* <Box
                  style={{
                    maxWidth: "100px",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >{`${trato?.nombreAgente ? `${trato?.nombreAgente} - ` : ""}`}</Box> */}
                <Typography
                  component="span"
                  variant="caption"
                  color="textPrimary"
                  style={{ textOverflow: "ellipsis" }}
                >
                  {`${clienteOContacto(trato, "telefono")}${clienteOContacto(trato, "email")}`}
                </Typography>
              </Box>
            </Box>
          }
        />
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          className="ToogleOpentratoInventario"
        >
          <IconButton id="toggleOpen" onClick={handleToggleOpenClicked}>
            <Icon fontSize="large">{open ? "expand_less" : "expand_more"}</Icon>
          </IconButton>
        </Box>
      </QListItemModel>
      <Collapse in={open}>
        <Box display={"flex"} justifyContent="space-around">
          {/* <QBoxButton id="nuevaTareaPhone" title="Nueva tarea email" icon="phone_enabled" onClick={() => navigate(`/ss/trato/${trato.idTrato}/tarea/nueva/llamada`)} />
          <QBoxButton id="nuevaTareaEmail" title="Nueva tarea email" icon="email" onClick={() => navigate(`/ss/trato/${trato.idTrato}/tarea/nueva/email`)} />
          <Icon className={`${classes.icon}`} onClick={() => navigate(`/ss/trato/${trato.idTrato}/tarea/nueva/whatsapp`)}>
            <img
              src="/img/whatsapp-icon.svg"
              width={`35px`}
              height={`35px`}
              alt="Whatsapp Logo"
            />

          </Icon> */}
          <ButtonContacto
            className={`${classes.icon}`}
            icon="phone_enabled"
            klass="error"
            disabled={false}
            onClick={() => navigate(`/ss/trato/${trato.idTrato}/tarea/nueva/llamada`)}
          />
          <ButtonContacto
            className={`${classes.icon}`}
            icon="mail"
            klass="success"
            disabled={false}
            onClick={() => navigate(`/ss/trato/${trato.idTrato}/tarea/nueva/email`)}
          />
          <ButtonContacto
            className={`${classes.icon}`}
            icon="whatsapp"
            klass="success_alt"
            disabled={false}
            onClick={() => navigate(`/ss/trato/${trato.idTrato}/tarea/nueva/whatsapp`)}
          />
          <ButtonContacto
            className={`${classes.icon}`}
            icon="groups"
            klass="info"
            disabled={false}
            onClick={() => navigate(`/ss/trato/${trato.idTrato}/tarea/nueva/cita`)}
          />
        </Box>
      </Collapse>
    </Box>
  );
}

export default ListItemTratoCampania;
