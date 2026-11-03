import { Box, Container, Field, Icon, IconButton, QBox, Typography } from "@quimera/comps";
import { TreeItem, TreeView } from "@quimera/thirdparty";
import Quimera, { PropValidation, useStateValue, util } from "quimera";
import React, { useEffect } from "react";

function DocumentosRepresentantes({ useStyles }) {
  const [
    {
      data,
      carpetaActual,
      list,
      documentoSeleccionado,
      documentosBusqueda,
      buscando,
      textoBusqueda,
    },
    dispatch,
  ] = useStateValue();
  const classes = useStyles();

  useEffect(() => {
    dispatch({
      type: "onInit",
    });
  }, [dispatch]);

  // const datos = {
  //   id: 'root',
  //   name: 'Parent',
  //   children: [
  //     {
  //       id: '1',
  //       name: 'Child - 1'
  //     },
  //     {
  //       id: '3',
  //       name: 'Child - 3',
  //       children: [
  //         {
  //           id: '4',
  //           name: 'Child - 4'
  //         }
  //       ]
  //     }
  //   ]
  // }

  const renderTree = nodes => (
    <TreeItem
      key={nodes.id}
      itemId={String(nodes.id)}
      label={
        <div
          style={{ display: "flex", alignItems: "center", paddingLeft: "4px" }}
          onClick={
            nodes.type === "doc"
              ? () => {
                  dispatch({
                    type: "onDocumentoSeleccionado",
                    payload: {
                      nombreDocumentoSeleccionado: nodes.name,
                      idDocumentoSeleccion: nodes.id,
                    },
                  });
                }
              : () => {
                  dispatch({ type: "onCarpetaClicked", payload: { carpeta: nodes } });
                }
          }
        >
          {nodes.type === "dir" ? (
            <Icon className={classes.iconFolder}>folder</Icon>
          ) : (
            <Icon className={classes.iconDocument}>description</Icon>
          )}
          {
            <Typography variant="body2" style={{ flexGrow: 1, fontSize: "15px" }}>
              {nodes.name}
            </Typography>
          }
        </div>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
    </TreeItem>
  );

  const icon = list ? "list" : "account_tree";
  const tree = !list;

  return (
    <Quimera.Template id="DocumentosRepresentantes">
      <Container maxWidth="md" style={{ marginTop: "16px" }}>
        <QBox
          titulo="Búsqueda de Documentos"
          botonesCabecera={
            [{ id: "modo", icon, disabled: false }]
            // <>
            //   <IconButton id='modo' color='white'>
            //     <Icon className={classes.iconoCabecera} ariaHidden={true}>
            //       {icon}
            //     </Icon>
            //   </IconButton>
            // </>
          }
          botones={[
            {
              id: "download",
              icon: "cloud_download",
              disabled: util.isEmptyObject(documentoSeleccionado),
            },
          ]}
        >
          <Field.Text
            id="textoBusqueda"
            className={classes.cajaBusqueda}
            variant="outlined"
            margin="dense"
            fullWidth
            startAdornment={
              <IconButton id="buscar" aria-label="Buscar documentos">
                <Icon>search</Icon>
              </IconButton>
            }
            endAdornment={
              textoBusqueda ? (
                <IconButton id="borrarBusqueda" aria-label="Borrar búsqueda">
                  <Icon>clear</Icon>
                </IconButton>
              ) : null
            }
            onKeyPress={event =>
              event.key === "Enter" &&
              dispatch({ type: "onEnterPressed", payload: { value: event.target.value } })
            }
          />
          {!buscando && tree && (
            <TreeView
              defaultExpandedItems={["root"]}
              slots={{
                collapseIcon: () => <Icon style={{ color: "#959698" }}>arrow_drop_down</Icon>,
                expandIcon: () => <Icon style={{ color: "#959698" }}>arrow_right</Icon>,
              }}
              style={{ marginTop: "16px" }}
              // defaultCollapseIcon={<Icon>folder_open</Icon>}
              // defaultExpandIcon={<Icon>folder</Icon>}
            >
              {renderTree(data)}
            </TreeView>
          )}
          {!buscando && list && <Quimera.SubView id="DocumentosRepresentantes/ListaDocumentos" />}
          {buscando && (
            <Box>
              <Box>
                {
                  //console.log('documentosBusqueda', documentosBusqueda.length)
                  documentosBusqueda.length > 0 ? (
                    <>
                      <Box className={classes.cabeceraBusqueda}>Resultados de búsqueda</Box>
                      {documentosBusqueda.map(hijo => (
                        <Box
                          key={hijo.id}
                          className={
                            hijo.id === documentoSeleccionado.idDocumentoSeleccion
                              ? classes.elementSelected
                              : classes.listElement
                          }
                          display="flex"
                          alignItems="center"
                          onClick={() =>
                            dispatch({
                              type: "onDocumentoSeleccionado",
                              payload: {
                                nombreDocumentoSeleccionado: hijo.name,
                                idDocumentoSeleccion: hijo.id,
                              },
                            })
                          }
                        >
                          {<Icon className={classes.iconDocument}>description</Icon>}
                          {hijo.name}
                        </Box>
                      ))}
                    </>
                  ) : (
                    <Box className={classes.cabeceraBusqueda}>No se han encontrado resultados</Box>
                  )
                }
              </Box>
            </Box>
          )}
        </QBox>
      </Container>
    </Quimera.Template>
  );
}

export default DocumentosRepresentantes;
