import { Box, QListItem, QTitleBox, Typography } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Divider } from "@quimera/thirdparty";
import { navigate } from "hookrouter";
import { useStateValue, util } from "quimera";
import InfiniteScroll from "react-infinite-scroll-component";

const useStyles = makeStyles(theme => ({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: "0.03em",
  },
}));

const iconTipoTarea = {
  "Llamada": {
    icon: "phone_enabled",
    color: "#FF9191",
  },
  "Email": {
    icon: "mail",
    color: "#99E2CE",
  },
  "Whatsapp": {
    // icon: 'whatsapp',
    content: <img src="/img/whatsapp-icon.svg" width="32px" height="32px" alt="Whatsapp Logo" />,
    color: "#46C756",
  },
  "Cita": {
    icon: "groups",
    color: "#76ccfd",
  },
  "-": {
    icon: "groups",
  },
};

export default function ListTareasCliente({ lineas }) {
  const [, dispatch] = useStateValue();
  const classes = useStyles();

  return (
    <Box className={classes.box}>
      <QTitleBox titulo="Tareas pendientes">
        {/* {!!lineas?.idList == 0 && ( */}
        {/* <List> */}
        <Divider />
        {lineas.idList.length > 0 ? (
          <Box id="scrollableBoxTareas" style={{ maxHeight: "300px", overflowY: "auto" }}>
            <InfiniteScroll
              dataLength={lineas.idList ? lineas?.idList?.length : 0}
              next={() => dispatch({ type: `onNextTareasPendientes` })}
              hasMore={lineas?.page?.next !== null}
              loader={<h4>Loading...</h4>}
              scrollableTarget="scrollableBoxTareas"
            >
              {/* <List> */}
              {Object.values(lineas?.dict ?? {})
                ?.sort((a, b) => {
                  const dateCompare = new Date(b?.fecha) - new Date(a?.fecha);
                  return dateCompare !== 0 ? dateCompare : (a?.idTarea - b?.idTarea);
                })
                ?.map(tarea => {
                  return (
                    <Box style={{ marginRight: "5px" }}>
                      <QListItem
                        key={tarea?.idTarea}
                        avatar={{
                          ...(iconTipoTarea[tarea?.tipo ?? "-"] ?? iconTipoTarea["-"]),
                        }}
                        onClick={() => navigate(`/ss/tareas/${tarea.idTarea}`)}
                        alignActions="flex-end"
                        tl={`${tarea?.titulo ?? ""} || ${tarea?.tituloTrato ?? ""}`}
                        tr={`${util.formatDate(tarea?.fecha)} ${tarea?.hora}`}
                      />
                    </Box>
                  );
                })}
            </InfiniteScroll>
          </Box>
        ) : (
          <Typography variant="spam" style={{ textAlign: "center", padding: "20px" }}>
            No hay tareas pendientes
          </Typography>
        )}
        <Divider />
      </QTitleBox>
    </Box >
  );
}
