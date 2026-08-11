import { SelectorValores } from "@quimera-extension/base-almacen";
import {
  Box,
  Button,
  DeleteButton,
  Field,
  Grid,
  Icon,
  QBox,
  QSection,
  Typography,
} from "@quimera/comps";
import Quimera, { getSchemas, useStateValue, useWidth } from "quimera";

import { LineasCausasPerdidaTrato } from "../../../comps";

function DetalleTiposTrato({ useStyles }) {
  const [{ nombreCausaNueva, causasPerdidaTrato, tipostrato, tipostratoBuffer }, dispatch] =
    useStateValue();
  const classes = useStyles();
  const width = useWidth();
  const schemas = getSchemas();

  const tipoTrato = tipostrato.dict[tipostrato.current] ?? {};

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;

  const tareasTrato = [
    { key: "Ninguna", value: "Ninguna" },
    { key: "Email", value: "Email" },
    { key: "Llamada", value: "Llamada" },
    { key: "Whatsapp", value: "Whatsapp" },
  ];
  const miTarea = tareasTrato.filter(tp => tp.key === tipostratoBuffer.tareaInicialTrato)[0];

  return (
    <Quimera.Template id="DetalleTiposTrato">
      {tipostratoBuffer && (
        <QBox
          width={anchoDetalle}
          titulo={tipoTrato?.tipo}
          botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
        >
          <Box px={0} my={1}>
            <QSection
              title="Tipo de Trato"
              actionPrefix="tipo"
              dynamicComp={() => (
                <Box m={1}>
                  <Field.Schema
                    id="tipostratoBuffer.tipo"
                    schema={schemas.tipotrato}
                    fullWidth
                    autoFocus
                  />
                </Box>
              )}
              saveDisabled={() => tipostratoBuffer.id === "" || tipostratoBuffer.tipo === ""}
            >
              <Box display="flex" alignItems="center" m={1}>
                <Icon color="action" fontSize="default" style={{ marginRight: "5px" }}>
                  person
                </Icon>
                <Typography variant="h5">{tipoTrato.tipo}</Typography>
              </Box>
            </QSection>
          </Box>

          <Box px={0} my={1}>
            <QSection
              title="Tarea Inicial del Trato"
              actionPrefix="tareaInicialTrato"
              dynamicComp={() => (
                <Box m={1}>
                  <SelectorValores
                    id="tipostratoBuffer.tareaInicialTrato"
                    valores={tareasTrato}
                    value={tipostratoBuffer.tareaInicialTrato}
                    arrayKeyValue
                    fullWidth
                  ></SelectorValores>
                </Box>
              )}
            >
              <Box display="flex" alignItems="center" m={1}>
                <Icon color="action" fontSize="default" style={{ marginRight: "5px" }}>
                  task
                </Icon>
                <Typography variant="h5">{miTarea?.value || "Ninguna"}</Typography>
              </Box>
            </QSection>
          </Box>

          <Box mt={1} display="flex" justifyContent="space-between">
            <Field.CheckBox
              id="tipostratoBuffer.avisoAgentePorDefecto"
              label="Avisar de agente no informado al generar tratos desde campaña"
              checked={tipostratoBuffer.avisoAgentePorDefecto}
            />
          </Box>

          <Box mt={1} display="flex" justifyContent="space-between">
            <Field.CheckBox
              id="tipostratoBuffer.exigirGenerarPedido"
              label="Exigir generación de pedido para ganar el trato"
              checked={tipostratoBuffer.exigirGenerarPedido}
            />
          </Box>

          <Grid container size={12} justifyContent="center">
            <Grid size={4}>
              <QSection
                actionPrefix="eliminarTipoTrato"
                title="Eliminar tipo de trato"
                focusStyle="button"
                dynamicComp={() => (
                  <Box
                    display="flex"
                    flexDirection="column"
                    className={classes.deleteBox}
                    px={2}
                    py={1}
                  >
                    <Typography variant="subtitle2" className={classes.deleteText}>
                      Se va a eliminar el tipo de trato.
                    </Typography>
                    <Typography variant="subtitle2">¿Desea continuar?</Typography>
                  </Box>
                )}
                cancel={{
                  className: classes.deleteCancelButton,
                }}
                save={{
                  icon: <Icon>delete</Icon>,
                  text: "Eliminar",
                  className: classes.deleteText,
                }}
              >
                <Box display="flex" justifyContent="center" p={1}>
                  <DeleteButton variant="outlined" />
                </Box>
              </QSection>
            </Grid>
          </Grid>
          <Grid container size={12} justifyContent="center">
            <Grid container size={12} justifyContent="flex-start">
              <Typography variant="overline" align="left" className={classes.labelEdicion}>
                Causas de pérdida de trato
              </Typography>
            </Grid>
            <Grid container size={12} justifyContent="space-between">
              <Grid container size={12}>
                <Grid size={{ xs: 12, md: 10 }} className={classes.borde}>
                  <Field.Text
                    id="nombreCausaNueva"
                    value={nombreCausaNueva}
                    style={{ fontSize: "0.95rem" }}
                    onKeyDown={event => {
                      event.keyCode === 13 && event.preventDefault();
                      dispatch({
                        type: "handleTextFieldKey",
                        payload: { event, id: "nombreCausaNueva" },
                      });
                    }}
                    placeholder="Anota la descripción de la nueva causa"
                    fullWidth
                    naked
                    multiline
                    maxRows={4}
                  />
                </Grid>
                <Grid container size={{ xs: 12, md: 2 }} justifyContent="flex-end" alignItems="center">
                  <Button
                    id="anadirCausa"
                    color="primary"
                    text="Añadir"
                    onClick={() => dispatch({ type: "onAnadirCausaClicked" })}
                    disabled={nombreCausaNueva?.length === 0}
                  ></Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid container size={12}>
              <LineasCausasPerdidaTrato lineas={causasPerdidaTrato} />
            </Grid>
          </Grid>
        </QBox>
      )}
    </Quimera.Template>
  );
}

export default DetalleTiposTrato;
