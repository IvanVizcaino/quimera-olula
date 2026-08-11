import { Box, Icon, QListItem, QTitleBox, Typography } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";
import { Divider, InfiniteScroll } from "@quimera/thirdparty";
import { navigate, useStateValue } from "quimera";
import { ACL } from "quimera/lib";

const useStyles = makeStyles(theme => ({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: "0.03em",
  },
}));

export default function ListContactoCurso({ lineas }) {
  const [, dispatch] = useStateValue();
  const classes = useStyles();
  const actionEnabled = true;
  // util.getUser().group === "MKT" || util.getUser().group === "Responsable de marketing"
  //   ? true
  //   : false;

  return (
    <Box className={classes.box}>
      <QTitleBox titulo="Contactos Curso">
        {/* {!!lineas?.idList == 0 && ( */}
        {/* <List> */}
        <Divider />
        {lineas.idList.length > 0 ? (
          <Box id="scrollableBoxContactos" style={{ maxHeight: "300px", overflowY: "auto" }}>
            <InfiniteScroll
              dataLength={lineas.idList ? lineas?.idList?.length : 0}
              next={() => dispatch({ type: `onNextContactosevento` })}
              hasMore={lineas?.page?.next !== null}
              loader={<h4>Loading...</h4>}
              scrollableTarget="scrollableBoxContactos"
            >
              {/* <List> */}
              {Object.values(lineas?.dict ?? {})
                ?.sort((a, b) => a.codContacto > b.codContacto)
                ?.map(contacto => {
                  return (
                    <QListItem
                      key={contacto?.codContacto}
                      avatar={{
                        icon: "account_circle",
                        color: "",
                      }}
                      chip={
                        ACL.can("contactos:revisar_contacto") &&
                        !contacto.datosRevisados && {
                          icon: "new_releases",
                          soloIcono: true,
                          color: "",
                        }
                      }
                      acciones={
                        actionEnabled
                          ? [
                            <Box
                              className=""
                              onClick={() =>
                                dispatch({
                                  type: `onRemoveContactoEvento`,
                                  payload: { codContacto: contacto?.codContacto },
                                })
                              }
                            >
                              <Icon>delete</Icon>
                            </Box>,
                          ]
                          : []
                      }
                      onClick={() => navigate(`/ss/contacto/${contacto?.codContacto}`)}
                      alignActions="flex-end"
                      tr={contacto?.nombreContacto ?? ""}
                      br={contacto?.emailContacto}
                      // tr={util.formatDate(curso?.fechaIni)}
                      tl={contacto?.telefonoContacto}
                    />
                  );
                })}
              {/* </List> */}
            </InfiniteScroll>
          </Box>
        ) : (
          <Typography variant="spam" style={{ textAlign: "center", padding: "20px" }}>
            No hay contactos
          </Typography>
        )}
        <Divider />
      </QTitleBox>
    </Box>
  );
}
