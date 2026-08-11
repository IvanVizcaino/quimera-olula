// import { Chip } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { useState } from "react";

import {
  Avatar,
  Badge,
  Box,
  Chip,
  Icon,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "../";

const useStyles = makeStyles(theme => ({
  selected: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    borderTop: `2px solid ${theme.palette.secondary.main}`,
  }
}));

function QListItem({ alignActions = "center", selected, badge, avatar, chip, tl, tr, ml, mr, bl, br, acciones, onClick, ...props }) {
  const classes = useStyles();
  const [accionesAbierto, setAccionesAbierto] = useState(false);

  return (
    <>
      <ListItem
        disableGutters
        {...props}
        onClick={null}
        className={selected ? classes.selected : props.className ? props.className : null}
      >
        <Box className="YBQListItem" width={1} display="flex" alignItems={alignActions ? alignActions : "center"}>
          <Box width={acciones ? 0.9 : 1} display={"flex"} alignItems={"center"} onClick={onClick}>
            {avatar && (
              <ListItemAvatar>
                <Badge
                  invisible={badge?.invisible ?? false}
                  overlap="circular"
                  badgeContent={<Icon>{badge?.icon ?? null}</Icon>}
                >
                  <Avatar style={{ background: avatar.color }}>
                    {avatar.icon && <Icon>{avatar.icon}</Icon>}
                    {!avatar.icon && avatar.content && avatar.content}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
            )}
            {chip && (
              <Chip
                label={chip.texto}
                icon={<Icon sx={{ padding: 0, margin: 0, color: "#ff7f50 !important", fontSize: "1.5rem" }}>{chip.icon}</Icon>}
                size="small"
                sx={chip.soloIcono
                  ? { backgroundColor: "transparent", color: "#ff7f50" }
                  : { borderRadius: "4px", mr: 1, fontSize: "0.8rem", backgroundColor: "#ff7f50", textTransform: "uppercase", color: "white" }
                }
              />
            )}
            <ListItemText
              disableTypography
              primary={
                <Box display="flex" flexDirection="column">
                  <Box
                    width={1}
                    display="flex"
                    justifyContent="space-between"
                    className="YBQListItemT"
                    style={{ overflow: "hidden", whiteSpace: "nowrap", gap: "1em" }}
                  >
                    <Box
                      display="inline"
                      style={{
                        overflowX: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Typography
                        component="span"
                        variant="body1"
                        color="textPrimary"
                        className="YBQListItemTL"
                        style={{ fontWeight: 700, textOverflow: "ellipsis" }}
                      >
                        {tl ?? ""}
                      </Typography>
                    </Box>
                    <Typography
                      component="span"
                      variant="body1"
                      color="textPrimary"
                      className="YBQListItemTR"
                      style={{ fontWeight: 700, textOverflow: "ellipsis" }}
                    >
                      {tr ?? ""}
                    </Typography>
                  </Box>
                  {(ml || mr) && (
                    <Box
                      width={1}
                      display="flex"
                      justifyContent="space-between"
                      className="YBQListItemT"
                      style={{ overflow: "hidden", whiteSpace: "nowrap", gap: "1em" }}
                    >
                      <Box
                        display="inline"
                        style={{
                          overflowX: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body1"
                          color="textPrimary"
                          className="YBQListItemML"
                          style={{ fontWeight: 700, textOverflow: "ellipsis" }}
                        >
                          {ml ?? ""}
                        </Typography>
                      </Box>
                      <Typography
                        component="span"
                        variant="body1"
                        color="textPrimary"
                        className="YBQListItemMR"
                        style={{ fontWeight: 700, textOverflow: "ellipsis" }}
                      >
                        {mr ?? ""}
                      </Typography>
                    </Box>
                  )}
                </Box>
              }
              secondary={
                <Box
                  width={1}
                  display="flex"
                  justifyContent="space-between"
                  className="YBQListItemB"
                  style={{ overflow: "hidden", whiteSpace: "nowrap", gap: "1em" }}
                >
                  <Box
                    display="inline"
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Typography
                      component="span"
                      variant="caption"
                      color="textPrimary"
                      style={{ textOverflow: "ellipsis" }}
                    >
                      {bl ?? ""}
                    </Typography>
                  </Box>
                  <Box display="inline">
                    <Typography
                      component="span"
                      variant="caption"
                      color="textPrimary"
                      style={{ textOverflow: "ellipsis" }}
                    >
                      {br ?? ""}
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </Box>
          <Box width={acciones ? 0.1 : 0}>
            {acciones?.length === 1 && (
              <Box mx={1} display={"flex"} justifyContent={"center"}>
                {acciones[0]}
              </Box>
            )}
            {acciones?.length > 1 && (
              <Box mx={1} display={"flex"} justifyContent={"center"}>
                <IconButton
                  id="cerrar"
                  size="small"
                  onClick={() => setAccionesAbierto(!accionesAbierto)}
                >
                  <Icon>{accionesAbierto ? "keyboard_arrow_up" : "keyboard_arrow_down"}</Icon>
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>
      </ListItem>
      {accionesAbierto && (
        <Box width={1} display={"flex"} alignItems={"center"} justifyContent={"flex-end"}>
          {acciones.map(accion => (
            <Box mx={1} display={"flex"} justifyContent={"center"}>
              {accion}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}

export default QListItem;
